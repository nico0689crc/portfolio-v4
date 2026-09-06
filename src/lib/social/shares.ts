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
 * Cadencia por defecto de la agenda: un posteo por semana, martes a las 9 de
 * la mañana. Es sólo la sugerencia que el panel precarga —la fecha siempre se
 * puede editar antes de confirmar—, así que cambiarla acá no toca nada de lo
 * ya programado.
 */
export const CADENCE_DAYS = 7;
export const SLOT_WEEKDAY = 2; // 0 = domingo
export const SLOT_HOUR = 9;
export const SLOT_TIMEZONE_OFFSET = '-03:00'; // America/Argentina/Buenos_Aires

/**
 * La próxima fecha libre de la agenda.
 *
 * Con agenda cargada es la última programada + la cadencia, que es lo que hace
 * que programar 50 notas sea un click cada una en vez de elegir fecha 50
 * veces. Vacía, cae en el próximo martes a las 9.
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
  // que "las 9" signifique las 9 de acá y no las 6 de la mañana.
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

/** Media adjunta a un envío. El carrusel de LinkedIn es un `document`, no varias imágenes. */
export type ShareAsset =
  | { kind: 'image'; url: string; altText?: string | null }
  | { kind: 'document'; url: string; title: string; thumbnailUrl: string };

type SharePost = { title: string; excerpt: string; locale: string; slug: string };

/**
 * Texto por defecto: título y bajada. El link sólo entra acá si se pidió
 * explícitamente no mandarlo al primer comentario.
 *
 * Se arma recién al entregar y no al programar, así una corrección de título
 * hecha después de agendar igual sale con el título nuevo.
 */
export function buildMessage(post: SharePost, linkInFirstComment = true): string {
  const body = `${post.title}\n\n${post.excerpt}`;

  return linkInFirstComment ? body : `${body}\n\n${shareUrl(post.locale, post.slug)}`;
}

/**
 * El primer comentario, que es donde va el link por defecto.
 *
 * Fuera del cuerpo por dos motivos que apuntan al mismo lado: LinkedIn recorta
 * el alcance de los posteos que mandan gente afuera, y con media adjunta la
 * tarjeta de preview no se arma igual, así que el link quedaría como texto
 * suelto sin ganar nada.
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

/** Cómo se lee cada estado en el panel. `queued` cambia de nombre al pasar su fecha. */
export function shareLabel(status: ShareStatus, scheduledAt: string): string {
  if (status === 'queued') {
    return scheduledAt <= new Date().toISOString() ? 'Publicado' : 'En Buffer';
  }

  return {
    scheduled: 'Programado',
    sending: 'Entregando',
    failed: 'Falló',
    canceled: 'Cancelado',
  }[status];
}
