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
 * Cadencia por defecto de la agenda: un posteo cada tres días, a las 11 de la
 * mañana. Es sólo la sugerencia que el panel precarga —la fecha siempre se
 * puede editar antes de confirmar—, así que cambiarla acá no toca nada de lo
 * ya programado.
 *
 * `SLOT_WEEKDAY` ya no se hereda de turno en turno: con siete días la cadencia
 * caía siempre en el mismo día, con tres no. Sigue valiendo para arrancar de
 * cero, que es cuando hay que elegir un día y el martes es tan bueno como otro.
 */
export const CADENCE_DAYS = 3;
export const SLOT_WEEKDAY = 2; // 0 = domingo
// Atado al `schedule` de `vercel.json`, que corre una vez por día: en el
// camino directo el posteo sale a la hora de esa corrida y no a la de la fila,
// así que el cron va diez minutos después de este turno (11 ART = 14 UTC →
// `10 14 * * *`). Mover esta hora sin mover el cron atrasa cada envío directo
// un día entero.
export const SLOT_HOUR = 11;
// America/Argentina/Buenos_Aires. Tiene que coincidir con `PANEL_TIMEZONE` de
// `@/lib/admin/dates`, que es con la que el panel muestra estas mismas fechas:
// acá el offset es para aritmética con strings ISO, allá el nombre IANA es lo
// que pide `Intl`. Argentina no tiene horario de verano, así que no divergen.
export const SLOT_TIMEZONE_OFFSET = '-03:00';

/**
 * El mismo offset en horas, para aritmética.
 *
 * La agenda entera —lo que se sugiere, lo que se muestra en el formulario y lo
 * que se guarda— se razona en esta zona y no en la del navegador ni en la del
 * server. Argentina no tiene horario de verano, así que un offset fijo alcanza
 * y no hace falta arrastrar una tabla de husos.
 */
export const AGENDA_OFFSET_HOURS = Number(SLOT_TIMEZONE_OFFSET.slice(0, 3));

/**
 * El día calendario argentino de un instante, como `YYYY-MM-DD`.
 *
 * Se calcula corriendo el instante por el offset y leyendo la fecha en UTC, en
 * vez de con `getDate()`: los getters locales responden al huso del server, que
 * en Vercel es UTC, y ahí cualquier turno después de las 21 cae al día
 * siguiente.
 */
const argentineDay = (date: Date): string =>
  new Date(date.getTime() + AGENDA_OFFSET_HOURS * 3_600_000).toISOString().slice(0, 10);

/** Suma días a un `YYYY-MM-DD` sin que el huso del server se meta. */
const addDays = (day: string, days: number): string => {
  const at = new Date(`${day}T00:00:00Z`);

  at.setUTCDate(at.getUTCDate() + days);

  return at.toISOString().slice(0, 10);
};

/** Ese día, a la hora del turno, en hora argentina. */
const slotAt = (day: string): Date =>
  new Date(`${day}T${String(SLOT_HOUR).padStart(2, '0')}:00:00${SLOT_TIMEZONE_OFFSET}`);

/**
 * La próxima fecha libre de la agenda.
 *
 * Con agenda cargada es el día de la última programada + la cadencia, que es lo
 * que hace que programar 50 notas sea un click cada una en vez de elegir fecha
 * 50 veces. Vacía, cae en el próximo martes a las 11.
 *
 * De la última programada se toma **sólo el día**: la hora siempre es
 * `SLOT_HOUR`. Antes se arrastraba entera, y como «Publicar ahora» reescribe
 * `scheduled_at` con el instante en que salió, publicar a mano un martes a las
 * 7:15 dejaba toda la agenda que seguía a las 7:15.
 */
export function nextSlot(lastScheduledAt: string | null): Date {
  const now = new Date();

  if (lastScheduledAt) {
    const next = slotAt(addDays(argentineDay(new Date(lastScheduledAt)), CADENCE_DAYS));

    // Si la agenda quedó toda en el pasado —el caso de arrancar de nuevo tras
    // una pausa— seguir la cadencia daría un turno ya vencido. Ahí se vuelve a
    // empezar desde el próximo turno real.
    if (next > now) return next;
  }

  // Al menos mañana: programar para dentro de un rato no le da tiempo a nadie
  // a revisar el texto antes de que el cron lo levante.
  let day = argentineDay(now);

  do {
    day = addDays(day, 1);
  } while (slotAt(day).getUTCDay() !== SLOT_WEEKDAY);

  return slotAt(day);
}

/**
 * El link que va en el posteo, con UTMs.
 *
 * Sin esto el tráfico de LinkedIn entra como directo o como referral suelto y
 * no hay forma de saber qué nota funcionó, que es el único motivo por el que
 * se comparte.
 */
export function shareUrl(locale: string, slug: string): string {
  return `${postUrl(locale, slug)}?utm_source=linkedin&utm_medium=social&utm_campaign=blog`;
}

/**
 * El artículo en el sitio, limpio.
 *
 * Es el mismo destino que `shareUrl` pero sin las UTMs: se usa para ir a mirar
 * la nota desde el panel, y contar esas visitas como tráfico de campaña
 * ensuciaría justo la métrica por la que existe `shareUrl`.
 */
export function postUrl(locale: string, slug: string): string {
  const prefix = locale === 'en' ? '' : `/${locale}`;

  return `${SITE_URL}${prefix}/blog/${slug}`;
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

type SharePost = {
  title: string;
  excerpt: string;
  locale: string;
  slug: string;
  /** El cuerpo en markdown. Sin él el texto sale como salía: título y bajada. */
  body?: string | null;
};

/**
 * Techo del texto por defecto.
 *
 * Con título y bajada —los ~350 caracteres que salían antes— el posteo entraba
 * entero en el feed sin desplegar el «…ver más», y nadie tenía motivo para
 * tocar nada. Con el arranque de la nota adentro hay algo que leer, y el clic
 * pasa a ser la consecuencia de haber leído en vez del precio de enterarse.
 *
 * Es un tope y no un objetivo: casi siempre corta antes la entrada del
 * artículo, que hoy deja los textos entre 550 y 1200 caracteres. Sube esto y
 * sólo cambian las notas de entrada larga; el límite duro de LinkedIn, los
 * 3000 que valida el formulario, queda bien lejos.
 */
export const MESSAGE_MAX_CHARS = 1_500;

/**
 * El límite duro de LinkedIn, el único que puede hacer fallar el envío.
 *
 * Sólo importa cuando el editor escribe su propio texto: el automático corta
 * mucho antes, en `MESSAGE_MAX_CHARS`.
 */
export const MESSAGE_HARD_LIMIT = 3_000;

/** Markdown a texto plano: en el feed no hay nada que renderice el fuente. */
const plainText = (block: string): string =>
  block
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[*_`]/g, '')
    // El salto simple es del archivo, no del párrafo: pegarlo al feed cortaría
    // la frase al medio.
    .replace(/\s*\n\s*/g, ' ')
    .trim();

/**
 * La entrada del artículo, hasta donde entre en el presupuesto.
 *
 * Se corta en el primer subtítulo a propósito: eso es lo que el autor escribió
 * para que se lea sin nada delante. Un párrafo tomado de más abajo arrastra el
 * contexto de su sección, y sin el subtítulo que lo presenta queda hablando de
 * algo que nadie nombró.
 */
const lede = (body: string, budget: number): string => {
  if (budget <= 0) return '';

  const blocks = body.split(/\n{2,}/).map(block => block.trim());
  const firstHeading = blocks.findIndex(block => block.startsWith('#'));

  const paragraphs = (firstHeading === -1 ? blocks : blocks.slice(0, firstHeading))
    // Código, citas e imágenes son del artículo: en un posteo se leen como
    // ruido pegado desde otro lado.
    .filter(block => block !== '' && !/^(```|>|!\[)/.test(block))
    .map(plainText);

  const taken: string[] = [];
  let used = 0;

  for (const paragraph of paragraphs) {
    // Los dos caracteres son la línea en blanco que lo separa del anterior.
    const cost = paragraph.length + (taken.length === 0 ? 0 : 2);

    if (used + cost > budget) break;

    taken.push(paragraph);
    used += cost;
  }

  // Si ni el primer párrafo entra, se corta en el último punto que quepa: uno
  // partido al medio termina en una coma y se lee como un error, no como un
  // recorte.
  if (taken.length === 0) {
    const first = paragraphs[0] ?? '';
    const end = first.slice(0, budget).lastIndexOf('. ');

    return end > 0 ? first.slice(0, end + 1) : '';
  }

  return taken.join('\n\n');
};

/**
 * Texto por defecto: título, bajada y el arranque de la nota. Nunca la URL.
 *
 * El link sale por la tarjeta de enlace o por el primer comentario, pero no
 * escrito en el cuerpo: LinkedIn le recorta el alcance a los posteos que mandan
 * gente afuera desde el texto, y con la tarjeta al pie el link repetido arriba
 * no agrega nada.
 *
 * Se arma recién al entregar y no al programar, así una corrección de título
 * —o del propio artículo— hecha después de agendar igual sale con lo vigente.
 */
export function buildMessage(post: SharePost): string {
  const head = `${post.title}\n\n${post.excerpt}`;

  // Lo que sobra después del título, la bajada y la línea en blanco que separa
  // al cuerpo de la bajada.
  const opening = post.body ? lede(post.body, MESSAGE_MAX_CHARS - head.length - 2) : '';

  return `${head}${opening === '' ? '' : `\n\n${opening}`}`;
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
