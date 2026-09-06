/**
 * Entregar un envío: lo que hace falta para que una fila de la agenda termine
 * publicada.
 *
 * Vive acá y no en el cron porque hay dos disparadores —el cron diario y el
 * botón «Publicar ahora» del panel— y son el mismo trabajo. Duplicarlo
 * garantizaba que se desviaran: el día que cambie cómo se arma el texto o cómo
 * se marca el resultado, hay un solo lugar donde tocarlo.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { getBufferConfig, scheduleLinkedInPost } from '@/lib/buffer';
import { BUCKETS, storageUrl } from '@/lib/content/storage';
import { publishToLinkedIn, type LinkedInConfig } from '@/lib/social/linkedin';
import {
  buildFirstComment,
  buildMessage,
  resolveAssets,
  shareUrl,
  type ShareAsset,
  type ShareStatus,
} from '@/lib/social/shares';
import type { Database } from '@/types/database';

/** Buffer rechaza un `dueAt` en el pasado; un envío atrasado sale enseguida. */
const MIN_LEAD_MS = 5 * 60 * 1000;

export type DeliveryConfig = {
  linkedin: LinkedInConfig | null;
  buffer: ReturnType<typeof getBufferConfig>;
};

export type DeliveryResult =
  | { ok: true; externalId: string; warning: string | null }
  | { ok: false; error: string; claimed: boolean };

/**
 * Las credenciales de los dos caminos, resueltas una vez.
 *
 * Un token vencido se descarta acá: LinkedIn devolvería 401 igual, pero con un
 * mensaje genérico, y el envío quedaría en `failed` sin decir que lo único que
 * falta es reconectar desde el panel.
 */
export async function getDeliveryConfig(
  supabase: SupabaseClient<Database>
): Promise<DeliveryConfig> {
  const { data: account } = await supabase
    .from('social_accounts')
    .select('access_token, account_urn, expires_at')
    .eq('provider', 'linkedin')
    .maybeSingle();

  return {
    linkedin:
      account && account.expires_at > new Date().toISOString()
        ? { accessToken: account.access_token, authorUrn: account.account_urn }
        : null,
    buffer: getBufferConfig(),
  };
}

export async function deliverShare(
  supabase: SupabaseClient<Database>,
  shareId: string,
  config: DeliveryConfig,
  options: {
    /** Desde qué estados se puede tomar. El cron sólo agarra lo agendado; el panel también reintenta lo fallido. */
    allowedFrom?: ShareStatus[];
    /** Publicar ya, ignorando la fecha de la agenda. Sólo cambia algo en Buffer, que es el que agenda. */
    immediate?: boolean;
  } = {}
): Promise<DeliveryResult> {
  const { allowedFrom = ['scheduled'], immediate = false } = options;

  // Se reserva ANTES de llamar a la API, no después. Si el proceso muere en el
  // medio la fila queda en `sending` y a la vista en el panel; con la marca al
  // final, en cambio, el siguiente intento la volvería a entregar y el posteo
  // saldría duplicado, que es lo único que no tiene arreglo.
  const { data: claimed } = await supabase
    .from('post_social_shares')
    .update({ status: 'sending' })
    .eq('id', shareId)
    .in('status', allowedFrom)
    .select('post_id, locale, message, scheduled_at, assets, link_in_first_comment, provider, attempts')
    .maybeSingle();

  if (!claimed) {
    return { ok: false, error: 'El envío ya no está disponible para entregar', claimed: false };
  }

  const attempts = claimed.attempts + 1;

  try {
    const { data: translation, error: missing } = await supabase
      .from('post_translations')
      .select('title, excerpt, body, slug, cover_alt, posts!inner(cover_path)')
      .eq('post_id', claimed.post_id)
      .eq('locale', claimed.locale)
      .single();

    if (missing || !translation) throw new Error(missing?.message ?? 'La traducción ya no existe');

    const post = {
      title: translation.title,
      excerpt: translation.excerpt,
      // El arranque de la nota entra en el texto por defecto, así que el cuerpo
      // viaja hasta acá aunque no se publique nada de él cuando hay mensaje
      // escrito a mano.
      body: translation.body,
      locale: claimed.locale,
      slug: translation.slug,
    };

    // Todo se resuelve acá y no al agendar: si el título se corrigió o se
    // cambió la portada después de programar, sale lo vigente.
    const assets = resolveAssets(
      claimed.assets as ShareAsset[] | null,
      translation.posts.cover_path
        ? {
            url: storageUrl(translation.posts.cover_path, BUCKETS.postMedia),
            altText: translation.cover_alt,
          }
        : null
    );


    const cover = translation.posts.cover_path
      ? storageUrl(translation.posts.cover_path, BUCKETS.postMedia)
      : null;

    // La tarjeta de enlace se guarda como marca vacía y se completa recién acá,
    // con el título y la bajada vigentes. Guardarla resuelta al programar
    // significaría publicar en noviembre una tarjeta escrita en septiembre.
    const content: ShareAsset[] = assets.map(asset =>
      asset.kind === 'article' && !('url' in asset)
        ? {
            kind: 'article' as const,
            url: shareUrl(post.locale, post.slug),
            title: translation.title,
            description: translation.excerpt,
            thumbnailUrl: cover,
          }
        : asset
    );

    // El cuerpo nunca lleva la URL: el link sale por la tarjeta o por el primer
    // comentario. Con tarjeta el comentario además sobra, porque la tarjeta ya
    // es el link y repetirlo sería duplicarlo.
    const hasArticle = content.some(asset => asset.kind === 'article');
    const linkInFirstComment = claimed.link_in_first_comment && !hasArticle;

    const text = claimed.message?.trim() || buildMessage(post);
    const firstComment = linkInFirstComment ? buildFirstComment(post) : null;

    let externalId: string;
    // Un aviso que no es un fallo: el posteo salió pero algo secundario no.
    let warning: string | null = null;

    if (claimed.provider === 'linkedin') {
      if (!config.linkedin) throw new Error('No hay cuenta de LinkedIn conectada en el panel');

      const result = await publishToLinkedIn(config.linkedin, { text, assets: content, firstComment });

      externalId = result.postUrn;
      warning = result.commentError;
    } else {
      if (!config.buffer) throw new Error('BUFFER_API_KEY / BUFFER_LINKEDIN_CHANNEL_ID no configurados');

      externalId = await scheduleLinkedInPost(config.buffer, {
        text,
        dueAt: new Date(Math.max(new Date(claimed.scheduled_at).getTime(), Date.now() + MIN_LEAD_MS)),
        assets: content,
        firstComment,
        immediate,
      });
    }

    const deliveredAt = new Date().toISOString();

    await supabase
      .from('post_social_shares')
      .update({
        status: 'queued',
        external_id: externalId,
        delivered_at: deliveredAt,
        attempts,
        // El aviso ocupa la misma columna que el error pero el estado queda en
        // `queued`: el panel lo muestra sin marcar el envío como fallido, que
        // es lo correcto cuando el posteo ya está publicado.
        error: warning,
        // Publicar a mano adelanta la agenda a ahora. Si no, la fila diría que
        // sale el martes cuando ya salió, y el panel la mostraría pendiente.
        ...(immediate ? { scheduled_at: deliveredAt } : {}),
      })
      .eq('id', shareId);

    return { ok: true, externalId, warning };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);

    // Queda en `failed` con el motivo escrito, no de vuelta en `scheduled`: un
    // envío que falla todos los días en silencio no se entera nadie. Desde el
    // panel se reintenta a mano.
    await supabase
      .from('post_social_shares')
      .update({ status: 'failed', error: message, attempts })
      .eq('id', shareId);

    return { ok: false, error: message, claimed: true };
  }
}
