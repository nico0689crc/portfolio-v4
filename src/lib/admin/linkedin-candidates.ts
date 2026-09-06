/**
 * Los artículos que todavía no tienen turno en la agenda de LinkedIn.
 *
 * Vive aparte de la página porque la lista se pagina contra el server: la
 * primera página la arma el componente de servidor y las siguientes las pide el
 * navegador por un action, y las dos tienen que salir de la misma consulta o el
 * filtro y el orden se van separando sin que nadie lo note.
 */

// Lib Imports
import { BUCKETS, storageUrl } from '@/lib/content/storage'
import { SHARE_LOCALE, buildMessage, postUrl } from '@/lib/social/shares'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database'

/**
 * Cuántos candidatos entran en una página.
 *
 * Diez es lo que se ve sin scrollear al lado de la agenda, y con la miniatura
 * de cada uno son diez imágenes y no las cincuenta que pedía la lista entera.
 */
export const CANDIDATES_PER_PAGE = 10

/** Sin fila en `post_social_decisions`, la nota todavía no se miró. */
export type ShareDecision = Database['public']['Enums']['social_share_decision'] | null

/**
 * Qué parte del archivo se está mirando.
 *
 * Son tres preguntas distintas —¿la aprobé?, ¿ya salió?, ¿está en el blog?— y
 * ponerlas en tres selects convertía la columna en un tablero. Las dos primeras
 * viven acá porque casi siempre se preguntan juntas: la vista por defecto es la
 * intersección útil, y las demás abren cada mitad cuando hace falta. La tercera
 * quedó en su propio control, que es de tres opciones y no se cruza con estas.
 */
export type CandidateFilter =
  /** Lo accionable: aprobado o sin decidir, sin turno y que nunca salió. */
  | 'to-schedule'
  /** Lo que falta mirar. Es la cola de curaduría, no la de programación. */
  | 'undecided'
  | 'approved'
  | 'discarded'
  /** Lo que ya salió alguna vez: la lista de la que se recircula. */
  | 'shared'
  | 'all'

/** `live` es lo que ya se ve en el blog; `upcoming`, lo que tiene fecha futura. */
export type BlogFilter = 'all' | 'live' | 'upcoming'

/**
 * La lista abre en lo accionable.
 *
 * No todo artículo es para LinkedIn, y sin la curaduría la lista repetía cada
 * semana las mismas notas ya descartadas de memoria. Lo descartado, lo que ya
 * tiene turno y lo que ya salió no aparecen de entrada: los tres son trabajo
 * terminado, y lo que queda es exactamente lo que falta decidir o programar.
 */
export const DEFAULT_CANDIDATE_FILTER: CandidateFilter = 'to-schedule'
export const DEFAULT_BLOG_FILTER: BlogFilter = 'all'

export type Candidate = {
  postId: string
  key: string
  title: string
  publishedAt: string | null
  /** Si el artículo ya se ve en el blog. Con fecha futura sigue siendo una vista previa. */
  isLive: boolean
  /** Aprobado, descartado o sin mirar todavía. */
  decision: ShareDecision
  /** Cuándo salió por última vez en LinkedIn, si ya salió. Evita repetirla sin querer. */
  lastSharedAt: string | null
  /** El texto que saldría si el campo queda vacío. Nunca incluye la URL. */
  autoMessage: string
  /** Adónde ir a mirarlo: el artículo si ya salió, su vista previa si todavía no. */
  postUrl: string
  /** La portada. Sin ella tampoco hay miniatura para el PDF, que Buffer exige. */
  coverUrl: string | null
}

export type CandidatePage = {
  items: Candidate[]
  /** Cuántos coinciden con los filtros y la búsqueda puestos. */
  matching: number
  /** Cuántos hay sin turno reservado, filtros aparte: el universo de la lista. */
  total: number
  /**
   * Cuántos quedan por decidir o programar, sin filtros ni búsqueda.
   *
   * Es la cuenta del encabezado, y no `total`, porque lo descartado y lo que ya
   * salió no son trabajo pendiente: contarlos ahí inflaba el número justo con
   * lo que ya se resolvió.
   */
  actionable: number
  /** Posición del primero de la página dentro de `matching`, base 1. Cero si no hay ninguno. */
  from: number
  /**
   * Cuántas páginas hay.
   *
   * Lo cuenta el server y no el cliente para que `CANDIDATES_PER_PAGE` no tenga
   * que cruzar al bundle: este módulo abre una conexión a Supabase y no puede
   * importarse desde un componente de cliente ni por una constante.
   */
  pages: number
  error: string | null
}

export type CandidateQuery = {
  /** Base 1, como la muestra el paginador. */
  page?: number
  query?: string
  filter?: CandidateFilter
  blog?: BlogFilter
}

const empty = (error: string | null): CandidatePage => ({
  items: [],
  matching: 0,
  total: 0,
  actionable: 0,
  from: 0,
  pages: 1,
  error
})

/**
 * Una página de la lista «sin programar».
 *
 * Son dos consultas y el cruce en memoria, en vez de resolverlo todo en SQL:
 * el índice —título y clave de cada nota publicada— es liviano y se filtra acá
 * con las mismas reglas que antes vivían en el componente, y recién sobre los
 * diez que quedan se pide el cuerpo del artículo, que es la columna pesada y la
 * que necesita `buildMessage`. Antes viajaba el cuerpo de cada nota publicada
 * para armar cincuenta textos por defecto que casi nunca se llegaban a mirar.
 */
export async function listCandidates({
  page = 1,
  query = '',
  filter = DEFAULT_CANDIDATE_FILTER,
  blog = DEFAULT_BLOG_FILTER
}: CandidateQuery = {}): Promise<CandidatePage> {
  const supabase = await createSupabaseServerClient()

  const [
    { data: shares, error: sharesError },
    { data: decisions, error: decisionsError },
    { data: index, error: indexError }
  ] = await Promise.all([
    supabase.from('post_social_shares').select('post_id, status, delivered_at').eq('channel', 'linkedin'),
    supabase.from('post_social_decisions').select('post_id, decision').eq('channel', 'linkedin'),
    supabase
      .from('post_translations')
      // Por fecha de publicación, la más vieja primero: la lista es una cola de
      // trabajo —el archivo que falta difundir— y se recorre desde el fondo.
      // De paso deja arriba lo que ya está en el blog, que es lo difundible.
      .select('post_id, title, slug, published_at, posts!inner(key, archived_at, cover_path)')
      .eq('locale', SHARE_LOCALE)
      .eq('status', 'published')
      .order('published_at', { ascending: true, nullsFirst: true })
  ])

  if (sharesError || decisionsError || indexError) {
    return empty((sharesError ?? decisionsError ?? indexError)!.message)
  }

  // Sólo se ofrece lo que no tiene un envío en curso. Lo ya publicado sí puede
  // volver a la lista: recircular una nota vieja es el caso más valioso.
  const taken = new Set<string>()

  // La última vez que cada nota salió, para no repetirla sin querer.
  const lastShared = new Map<string, string>()

  for (const share of shares ?? []) {
    if (share.status === 'scheduled' || share.status === 'sending') taken.add(share.post_id)

    if (!share.delivered_at) continue

    const previous = lastShared.get(share.post_id)

    if (!previous || share.delivered_at > previous) lastShared.set(share.post_id, share.delivered_at)
  }

  const decided = new Map((decisions ?? []).map(row => [row.post_id, row.decision]))

  const available = index.filter(row => row.posts.archived_at === null && !taken.has(row.post_id))

  // `published` en la columna `status` no alcanza: una nota con fecha futura ya
  // está aprobada pero el sitio todavía la sirve sólo como vista previa.
  const now = new Date().toISOString()
  const isLive = (row: (typeof available)[number]) => row.published_at !== null && row.published_at <= now

  /** Lo accionable: ni descartado ni ya salido. Es la vista por defecto y la cuenta del encabezado. */
  const isActionable = (postId: string) =>
    decided.get(postId) !== 'discarded' && !lastShared.has(postId)

  const byDecision = (postId: string) => {
    switch (filter) {
      case 'to-schedule':
        return isActionable(postId)
      case 'undecided':
        return !decided.has(postId)
      case 'approved':
        return decided.get(postId) === 'approved'
      case 'discarded':
        return decided.get(postId) === 'discarded'
      case 'shared':
        return lastShared.has(postId)
      default:
        return true
    }
  }

  const needle = query.trim().toLowerCase()

  const matches = available.filter(row => {
    if (!byDecision(row.post_id)) return false
    if (blog === 'live' && !isLive(row)) return false
    if (blog === 'upcoming' && isLive(row)) return false

    return !needle || `${row.title} ${row.posts.key}`.toLowerCase().includes(needle)
  })

  const pages = Math.max(1, Math.ceil(matches.length / CANDIDATES_PER_PAGE))
  // Una página que se quedó sin filas —porque se programó lo que había— cae en
  // la última que sí existe en vez de devolver el vacío.
  const current = Math.min(Math.max(1, Math.trunc(page)), pages)
  const slice = matches.slice((current - 1) * CANDIDATES_PER_PAGE, current * CANDIDATES_PER_PAGE)

  const texts = new Map<string, { excerpt: string; body: string }>()

  if (slice.length > 0) {
    const { data, error } = await supabase
      .from('post_translations')
      .select('post_id, excerpt, body')
      .eq('locale', SHARE_LOCALE)
      .in(
        'post_id',
        slice.map(row => row.post_id)
      )

    if (error) return empty(error.message)

    for (const row of data) texts.set(row.post_id, { excerpt: row.excerpt, body: row.body })
  }

  const items = slice.map(row => ({
    postId: row.post_id,
    key: row.posts.key,
    title: row.title,
    publishedAt: row.published_at,
    isLive: isLive(row),
    decision: decided.get(row.post_id) ?? null,
    lastSharedAt: lastShared.get(row.post_id) ?? null,
    coverUrl: row.posts.cover_path ? storageUrl(row.posts.cover_path, BUCKETS.postMedia) : null,
    autoMessage: buildMessage({
      title: row.title,
      excerpt: texts.get(row.post_id)?.excerpt ?? '',
      body: texts.get(row.post_id)?.body,
      locale: SHARE_LOCALE,
      slug: row.slug
    }),
    // Sin fecha cumplida el slug público no resuelve, así que el link va a la
    // vista previa: abrir un 404 desde el panel no dice nada sobre la nota.
    postUrl: isLive(row) ? postUrl(SHARE_LOCALE, row.slug) : `/${SHARE_LOCALE}/preview/blog/${row.posts.key}`
  }))

  return {
    items,
    matching: matches.length,
    total: available.length,
    actionable: available.filter(row => isActionable(row.post_id)).length,
    // Lo cuenta el server porque es el único que conoce el tamaño de página, y
    // la página que se sirvió puede no ser la que se pidió.
    from: slice.length === 0 ? 0 : (current - 1) * CANDIDATES_PER_PAGE + 1,
    pages,
    error: null
  }
}
