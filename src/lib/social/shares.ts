/**
 * La agenda de difusión: lo que sabe el panel sobre qué nota sale a qué red y
 * cuándo.
 *
 * Vive aparte de `@/lib/content` a propósito: el contenido es lo que el sitio
 * muestra, esto es logística de marketing y no lo lee ninguna página pública.
 * El artículo tampoco sabe de esto — la referencia va en una sola dirección,
 * desde acá hacia `post_translations`.
 */

import { SITE_URL } from '@/lib/seo';
import type { Database } from '@/types/database';

export type ShareStatus = Database['public']['Enums']['social_share_status'];

/** El idioma que se cruza a LinkedIn. La versión en inglés no tiene audiencia ahí. */
export const SHARE_LOCALE = 'es';

/**
 * Cadencia por defecto de la agenda: un posteo por semana, martes a las 11 de
 * la mañana. Es sólo la sugerencia que el panel precarga —la fecha siempre se
 * puede editar antes de confirmar—, así que cambiarla acá no toca nada de lo
 * ya programado.
 */
export const CADENCE_DAYS = 7;
export const SLOT_WEEKDAY = 2; // 0 = domingo
export const SLOT_HOUR = 11;
export const SLOT_TIMEZONE_OFFSET = '-03:00'; // America/Argentina/Buenos_Aires

/**
 * La próxima fecha libre de la agenda.
 *
 * Con agenda cargada es la última programada + la cadencia, que es lo que hace
 * que programar 50 notas sea un click cada una en vez de elegir fecha 50
 * veces. Vacía, cae en el próximo martes a las 11.
 */
export function nextSlot(lastScheduledAt: string | null): Date {
  const now = new Date();

  if (lastScheduledAt) {
    const next = new Date(lastScheduledAt);

    next.setDate(next.getDate() + CADENCE_DAYS);

    // Si la agenda quedó toda en el pasado —el caso de arrancar de nuevo tras
    // una pausa— seguir la cadencia daría un turno ya vencido. Ahí se vuelve a
    // empezar desde el próximo turno real.
    if (next > now) return next;
  }

  // El offset fijo evita depender del huso del server —en Vercel es UTC— para
  // que "las 11" signifique las 11 de acá y no las 8 de la mañana.
  const slot = new Date(
    `${now.toISOString().slice(0, 10)}T${String(SLOT_HOUR).padStart(2, '0')}:00:00${SLOT_TIMEZONE_OFFSET}`
  );

  // Al menos mañana: programar para dentro de un rato no le da tiempo a nadie
  // a revisar el texto antes de que el cron lo levante.
  do {
    slot.setDate(slot.getDate() + 1);
  } while (slot.getDay() !== SLOT_WEEKDAY);

  return slot;
}

/**
 * El link que va en el posteo, con UTMs.
 *
 * Sin esto el tráfico de LinkedIn entra como directo o como referral suelto y
 * no hay forma de saber qué nota funcionó, que es el único motivo por el que
 * se comparte.
 */
export function shareUrl(locale: string, slug: string): string {
  const prefix = locale === 'en' ? '' : `/${locale}`;

  return `${SITE_URL}${prefix}/blog/${slug}?utm_source=linkedin&utm_medium=social&utm_campaign=blog`;
}

/**
 * Media adjunta a un envío.
 *
 * El carrusel de LinkedIn es un `document`, no varias imágenes. Y `article` es
 * la tarjeta de enlace: se guarda sin datos porque la Posts API **no scrapea la
 * URL** —un link suelto en el cuerpo no genera preview— así que hay que
 * mandarle título, bajada y miniatura, y esos se resuelven al entregar para que
 * salgan los vigentes.
 */
export type ShareAsset =
  | { kind: 'image'; url: string; altText?: string | null }
  | { kind: 'document'; url: string; title: string; thumbnailUrl: string }
  | { kind: 'article' }
  | { kind: 'article'; url: string; title: string; description: string; thumbnailUrl: string | null };

type SharePost = { title: string; excerpt: string; locale: string; slug: string };

/**
 * Texto por defecto: título, bajada y —salvo que el link se haya mandado al
 * primer comentario— la URL con UTMs.
 *
 * Se arma recién al entregar y no al programar, así una corrección de título
 * hecha después de agendar igual sale con el título nuevo.
 */
export function buildMessage(post: SharePost, linkInFirstComment = false): string {
  const body = `${post.title}\n\n${post.excerpt}`;

  return linkInFirstComment ? body : `${body}\n\n${shareUrl(post.locale, post.slug)}`;
}

/**
 * El primer comentario, la alternativa a dejar el link en el cuerpo.
 *
 * Existe porque LinkedIn recorta el alcance de los posteos que mandan gente
 * afuera. Ya no es el default: con tarjeta de enlace el link es la tarjeta, y
 * repetirlo en un comentario no agrega nada.
 */
export function buildFirstComment(post: SharePost): string {
  return shareUrl(post.locale, post.slug);
}

/**
 * Qué se adjunta finalmente.
 *
 * Null en la agenda significa "lo que tenga el artículo", así que se resuelve
 * contra la portada vigente al entregar y no contra la que había el día que se
 * programó. Sin portada no se inventa nada: sale sin media.
 */
export function resolveAssets(
  stored: ShareAsset[] | null,
  cover: { url: string; altText: string | null } | null
): ShareAsset[] {
  if (stored) return stored;

  return cover ? [{ kind: 'image', url: cover.url, altText: cover.altText }] : [];
}

/**
 * El posteo publicado, en LinkedIn.
 *
 * `external_id` guarda el URN que devuelve la API (`urn:li:share:…` o
 * `urn:li:ugcPost:…`) y ese mismo URN es el último tramo de la URL del feed, así
 * que el link sale de concatenar. Por Buffer el id es de Buffer y no hay URL
 * pública que armar: ahí devuelve null.
 */
export function linkedInPostUrl(
  externalId: string | null,
  provider: 'linkedin' | 'buffer' = 'buffer'
): string | null {
  if (!externalId || provider !== 'linkedin') return null;

  return `https://www.linkedin.com/feed/update/${encodeURIComponent(externalId)}/`;
}

/**
 * Cómo se lee cada estado en el panel.
 *
 * `queued` significa cosas distintas según por dónde salga: LinkedIn publica en
 * el acto, así que entregado es publicado; Buffer lo retiene hasta su fecha, y
 * hasta entonces decir «publicado» sería mentira.
 */
export function shareLabel(
  status: ShareStatus,
  scheduledAt: string,
  provider: 'linkedin' | 'buffer' = 'buffer'
): string {
  if (status === 'queued') {
    if (provider === 'linkedin') return 'Publicado';

    return scheduledAt <= new Date().toISOString() ? 'Publicado' : 'En Buffer';
  }

  return {
    scheduled: 'Programado',
    sending: 'Entregando',
    failed: 'Falló',
    canceled: 'Cancelado',
  }[status];
}
