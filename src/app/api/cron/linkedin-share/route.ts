import { createClient } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';
import { getBufferConfig, scheduleLinkedInPost } from '@/lib/buffer';
import { BUCKETS, storageUrl } from '@/lib/content/storage';
import { buildFirstComment, buildMessage, resolveAssets, type ShareAsset } from '@/lib/social/shares';
import type { Database } from '@/types/database';

/**
 * Cron diario: entrega a Buffer los envíos de la agenda que están por salir.
 *
 * El calendario lo arma una persona en `/admin/linkedin`; acá no se decide
 * nada, sólo se ejecuta. Por eso el cron no busca "notas publicadas sin
 * compartir" —eso barrería el archivo entero la primera vez que corra— sino
 * filas concretas que alguien agendó.
 *
 * Entrega con anticipación (`LOOKAHEAD_HOURS`) en vez de justo a horario: el
 * cron corre una vez por día, así que no puede ser puntual, pero Buffer sí. Se
 * le pasa la fecha exacta como `dueAt` y publica solo.
 *
 * Única excepción del proyecto al "la service-role key queda afuera de la
 * app" (ver `src/lib/supabase/server.ts`): este handler no tiene sesión de
 * usuario —lo dispara Vercel Cron, no un editor logueado— así que no hay forma
 * de pasar `is_admin()` con la key anónima. Está gateado por `CRON_SECRET`,
 * igual de confiable que un script. La key no se reexporta: el cliente se arma
 * acá adentro y en ningún otro archivo de la app.
 */

/** Cuánto antes de su turno se le pasa un envío a Buffer. */
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

  if (!bufferConfig) {
    return NextResponse.json({ error: 'BUFFER_API_KEY / BUFFER_LINKEDIN_CHANNEL_ID no configurados' }, { status: 501 });
  }

  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } }
  );

  const horizon = new Date(Date.now() + LOOKAHEAD_HOURS * 3600 * 1000).toISOString();

  const { data: due, error } = await supabase
    .from('post_social_shares')
    .select('id, post_id, locale, message, scheduled_at, assets, link_in_first_comment')
    .eq('status', 'scheduled')
    .lte('scheduled_at', horizon)
    .order('scheduled_at', { ascending: true })
    .limit(BATCH);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const delivered: string[] = [];
  const errors: Array<{ id: string; message: string }> = [];

  for (const share of due ?? []) {
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

      const externalId = await scheduleLinkedInPost(bufferConfig, {
        text: share.message?.trim() || buildMessage(post, linkInFirstComment),
        dueAt: new Date(Math.max(new Date(share.scheduled_at).getTime(), Date.now() + MIN_LEAD_MS)),
        assets,
        firstComment: linkInFirstComment ? buildFirstComment(post) : null,
      });

      await supabase
        .from('post_social_shares')
        .update({
          status: 'queued',
          external_id: externalId,
          delivered_at: new Date().toISOString(),
          attempts: claimed.attempts + 1,
          error: null,
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
