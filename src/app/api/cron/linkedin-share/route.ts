import { createClient } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';
import { getBufferConfig, scheduleLinkedInPost } from '@/lib/buffer';
import { BUCKETS, storageUrl } from '@/lib/content/storage';
import { publishToLinkedIn } from '@/lib/social/linkedin';
import { buildFirstComment, buildMessage, resolveAssets, type ShareAsset } from '@/lib/social/shares';
import type { Database } from '@/types/database';

/**
 * Cron diario: saca los envíos de la agenda que ya llegó su turno.
 *
 * El calendario lo arma una persona en `/admin/linkedin`; acá no se decide
 * nada, sólo se ejecuta. Por eso el cron no busca "notas publicadas sin
 * compartir" —eso barrería el archivo entero la primera vez que corra— sino
 * filas concretas que alguien agendó.
 *
 * Los dos caminos son distintos en un punto que define el resto:
 *
 * - **LinkedIn directo** publica en el acto. `lifecycleState: PUBLISHED` es lo
 *   único que la API acepta al crear, así que el horario del posteo es el
 *   horario del cron. Corriendo 12:00 UTC a diario, eso son las 9 de la mañana
 *   de Argentina, que es la cadencia acordada.
 * - **Buffer** sí agenda, así que se le entrega con anticipación
 *   (`LOOKAHEAD_HOURS`) pasándole la fecha exacta como `dueAt`.
 *
 * Única excepción del proyecto al "la service-role key queda afuera de la
 * app" (ver `src/lib/supabase/server.ts`): este handler no tiene sesión de
 * usuario —lo dispara Vercel Cron, no un editor logueado— así que no hay forma
 * de pasar `is_admin()` con la key anónima. Está gateado por `CRON_SECRET`,
 * igual de confiable que un script. La key no se reexporta: el cliente se arma
 * acá adentro y en ningún otro archivo de la app.
 */

/** Cuánto antes de su turno se le entrega un envío a Buffer, que sí agenda. */
const LOOKAHEAD_HOURS = 48;

/** Cuántos envíos entrega cada corrida. Tope de seguridad, no cadencia: la cadencia es la agenda. */
const BATCH = Number(process.env.LINKEDIN_SHARE_LIMIT ?? 1);

/** Buffer rechaza un `dueAt` en el pasado; un envío atrasado sale enseguida. */
const MIN_LEAD_MS = 5 * 60 * 1000;

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return NextResponse.json({ error: 'CRON_SECRET no está configurado' }, { status: 501 });
  }

  if (request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const bufferConfig = getBufferConfig();

  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } }
  );

  const { data: account } = await supabase
    .from('social_accounts')
    .select('access_token, account_urn, expires_at')
    .eq('provider', 'linkedin')
    .maybeSingle();

  // Un token vencido no se usa: LinkedIn devolvería un 401 igual, pero el
  // mensaje sería genérico y el envío quedaría en `failed` sin decir que lo
  // único que falta es reconectar desde el panel.
  const linkedinConfig =
    account && account.expires_at > new Date().toISOString()
      ? { accessToken: account.access_token, authorUrn: account.account_urn }
      : null;

  const now = new Date().toISOString();
  const horizon = new Date(Date.now() + LOOKAHEAD_HOURS * 3600 * 1000).toISOString();

  const pending = supabase
    .from('post_social_shares')
    .select('id, post_id, locale, message, scheduled_at, assets, link_in_first_comment, provider')
    .eq('status', 'scheduled')
    .order('scheduled_at', { ascending: true })
    .limit(BATCH);

  // Dos consultas y no una porque el horizonte depende del proveedor: a Buffer
  // se le adelanta el trabajo, LinkedIn se publica cuando de verdad toca. Un
  // único `lte` con el horizonte largo publicaría en LinkedIn hasta dos días
  // antes de tiempo.
  const [direct, queued] = await Promise.all([
    pending.eq('provider', 'linkedin').lte('scheduled_at', now),
    supabase
      .from('post_social_shares')
      .select('id, post_id, locale, message, scheduled_at, assets, link_in_first_comment, provider')
      .eq('status', 'scheduled')
      .eq('provider', 'buffer')
      .lte('scheduled_at', horizon)
      .order('scheduled_at', { ascending: true })
      .limit(BATCH),
  ]);

  const error = direct.error ?? queued.error;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const due = [...(direct.data ?? []), ...(queued.data ?? [])]
    .sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at))
    .slice(0, BATCH);

  const delivered: string[] = [];
  const errors: Array<{ id: string; message: string }> = [];

  for (const share of due) {
    // Se reserva ANTES de llamar a Buffer, no después. Si el proceso muere en
    // el medio la fila queda en `sending` y a la vista en el panel; con la
    // marca al final, en cambio, la corrida siguiente la volvería a entregar y
    // el posteo saldría duplicado, que es lo único que no tiene arreglo.
    const { data: claimed } = await supabase
      .from('post_social_shares')
      .update({ status: 'sending' })
      .eq('id', share.id)
      .eq('status', 'scheduled')
      .select('attempts')
      .maybeSingle();

    if (!claimed) continue;

    try {
      const { data: translation, error: missing } = await supabase
        .from('post_translations')
        .select('title, excerpt, slug, cover_alt, posts!inner(cover_path)')
        .eq('post_id', share.post_id)
        .eq('locale', share.locale)
        .single();

      if (missing || !translation) throw new Error(missing?.message ?? 'La traducción ya no existe');

      const post = {
        title: translation.title,
        excerpt: translation.excerpt,
        locale: share.locale,
        slug: translation.slug,
      };

      // Todo se resuelve acá y no al agendar: si el título se corrigió o se
      // cambió la portada después de programar, sale lo vigente.
      const assets = resolveAssets(
        share.assets as ShareAsset[] | null,
        translation.posts.cover_path
          ? {
              url: storageUrl(translation.posts.cover_path, BUCKETS.postMedia),
              altText: translation.cover_alt,
            }
          : null
      );

      // El link va al primer comentario haya o no media adjunta. LinkedIn
      // penaliza el alcance de un posteo con link externo en el cuerpo, y eso
      // pesa más que perder la tarjeta de preview.
      const linkInFirstComment = share.link_in_first_comment;

      const text = share.message?.trim() || buildMessage(post, linkInFirstComment);
      const firstComment = linkInFirstComment ? buildFirstComment(post) : null;

      let externalId: string;
      // Un aviso que no es un fallo: el posteo salió pero algo secundario no.
      let warning: string | null = null;

      if (share.provider === 'linkedin') {
        if (!linkedinConfig) throw new Error('No hay cuenta de LinkedIn conectada en el panel');

        const result = await publishToLinkedIn(linkedinConfig, { text, assets, firstComment });

        externalId = result.postUrn;
        warning = result.commentError;
      } else {
        if (!bufferConfig) throw new Error('BUFFER_API_KEY / BUFFER_LINKEDIN_CHANNEL_ID no configurados');

        externalId = await scheduleLinkedInPost(bufferConfig, {
          text,
          dueAt: new Date(Math.max(new Date(share.scheduled_at).getTime(), Date.now() + MIN_LEAD_MS)),
          assets,
          firstComment,
        });
      }

      await supabase
        .from('post_social_shares')
        .update({
          status: 'queued',
          external_id: externalId,
          delivered_at: new Date().toISOString(),
          attempts: claimed.attempts + 1,
          // El aviso ocupa la misma columna que el error pero el estado queda
          // en `queued`: el panel lo muestra sin marcar el envío como fallido,
          // que es lo correcto cuando el posteo ya está publicado.
          error: warning,
        })
        .eq('id', share.id);

      delivered.push(share.id);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);

      // Queda en `failed` con el motivo escrito, no en `scheduled`: un envío
      // que falla todos los días en silencio no se entera nadie. Desde el
      // panel se reintenta a mano.
      await supabase
        .from('post_social_shares')
        .update({ status: 'failed', error: message, attempts: claimed.attempts + 1 })
        .eq('id', share.id);

      errors.push({ id: share.id, message });
    }
  }

  return NextResponse.json({ delivered, errors, at: new Date().toISOString() });
}
