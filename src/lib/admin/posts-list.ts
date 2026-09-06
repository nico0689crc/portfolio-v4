/**
 * El listado del panel de posts, paginado contra el server.
 *
 * Vive aparte de la página por lo mismo que `linkedin-candidates`: la primera
 * página la arma el componente de servidor y las siguientes las pide el
 * navegador por un action, y las dos tienen que salir de la misma consulta o el
 * filtro y el orden se van separando sin que nadie lo note.
 */

// Lib Imports
import { BUCKETS, storageUrl } from '@/lib/content/storage';
import { createSupabaseServerClient } from '@/lib/supabase/server';

/** Cuántas filas entran en una página. Con la miniatura al lado, diez es lo que se ve sin scrollear. */
export const POSTS_PER_PAGE = 10;

/**
 * El idioma que representa a cada post en la lista: el original, no la
 * traducción. Lleva prefijo en la URL pública porque el default del sitio es
 * `en` —ver `DEFAULT_LOCALE`— y sólo ese va sin prefijo.
 */
const LIST_LOCALE = 'es';

export type PostFilter = 'todos' | 'publicados' | 'borradores' | 'archivados';

/** `creado` es el orden por defecto y el que ya trae la consulta. */
export type PostSort = 'creado' | 'fecha-asc' | 'fecha-desc';

export const DEFAULT_POST_FILTER: PostFilter = 'todos';
export const DEFAULT_POST_SORT: PostSort = 'creado';

export type PostRow = {
  key: string;
  title: string;
  coverUrl: string | null;
  archived: boolean;
  /** La primera fecha agendada entre los idiomas, o null si ninguno tiene. */
  publishedAt: string | null;
  /** Si esa fecha ya pasó. Con fecha futura el artículo está agendado, no publicado. */
  isLive: boolean;
  /** El artículo en el sitio, sólo si ya salió. Si todavía no, se mira por la vista previa. */
  liveUrl: string | null;
};

export type PostsPage = {
  items: PostRow[];
  /** Cuántos coinciden con el filtro puesto. */
  matching: number;
  /** Cuántos hay en cada filtro, para los botones. Se cuentan sobre el total, no sobre la página. */
  counts: Record<PostFilter, number>;
  /** Cuántos posts hay en total, archivados incluidos. Distingue «no hay ninguno» de «no hay en este filtro». */
  total: number;
  /** Posición del primero de la página dentro de `matching`, base 1. Cero si no hay ninguno. */
  from: number;
  /**
   * Cuántas páginas hay.
   *
   * Lo cuenta el server y no el cliente para que `POSTS_PER_PAGE` no tenga que
   * cruzar al bundle: este módulo abre una conexión a Supabase y no puede
   * importarse desde un componente de cliente ni por una constante.
   */
  pages: number;
  error: string | null;
};

export type PostsQuery = { page?: number; filter?: PostFilter; sort?: PostSort };

const empty = (error: string | null): PostsPage => ({
  items: [],
  matching: 0,
  counts: { todos: 0, publicados: 0, borradores: 0, archivados: 0 },
  total: 0,
  from: 0,
  pages: 1,
  error,
});

/**
 * La publicación se agenda con `published_at` a futuro, así que la fecha sola no
 * alcanza: hay que compararla contra ahora para saber si ya salió o falta.
 */
const publishState = (dates: (string | null)[]) => {
  const scheduled = dates.filter((d): d is string => d !== null).sort();

  if (scheduled.length === 0) return { date: null, published: false };

  return { date: scheduled[0], published: scheduled[0] <= new Date().toISOString() };
};

/**
 * Una página del listado.
 *
 * El filtro y el orden se resuelven en memoria y no en SQL, como antes: los dos
 * dependen de las traducciones embebidas. Filtrar «publicado» en SQL descartaría
 * el post entero cuando sólo un idioma cumple —que es justo el caso que hay que
 * mostrar— y ordenar por `published_at` reordenaría las traducciones adentro de
 * cada post, no los posts entre sí. Son decenas de filas sin el cuerpo del
 * artículo, así que traerlas y cruzarlas acá sale barato; lo que se pagina es lo
 * que cruza al navegador y las miniaturas que el navegador pide.
 */
export async function listPosts({
  page = 1,
  filter = DEFAULT_POST_FILTER,
  sort = DEFAULT_POST_SORT,
}: PostsQuery = {}): Promise<PostsPage> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from('posts')
    .select(
      `key, created_at, archived_at, cover_path,
       post_translations(locale, title, slug, status, published_at)`
    )
    .order('created_at', { ascending: false });

  if (error) return empty(error.message);

  const counts = {
    todos: data.filter(p => !p.archived_at).length,
    publicados: data.filter(
      p => !p.archived_at && p.post_translations.some(t => t.status === 'published')
    ).length,
    borradores: data.filter(
      p => !p.archived_at && !p.post_translations.some(t => t.status === 'published')
    ).length,
    archivados: data.filter(p => p.archived_at).length,
  };

  const matches = data.filter(post => {
    const statuses = post.post_translations.map(t => t.status);

    if (filter === 'archivados') return post.archived_at !== null;
    if (post.archived_at !== null) return false;
    if (filter === 'publicados') return statuses.includes('published');
    if (filter === 'borradores') return !statuses.includes('published');

    return true;
  });

  if (sort !== 'creado') {
    const direction = sort === 'fecha-asc' ? 1 : -1;

    matches.sort((a, b) => {
      const dateA = publishState(a.post_translations.map(t => t.published_at)).date;
      const dateB = publishState(b.post_translations.map(t => t.published_at)).date;

      // Sin fecha siempre al final, ordene como ordene: son los que todavía no
      // tienen nada agendado y no compiten con los que sí.
      if (dateA === null || dateB === null) return dateA === dateB ? 0 : dateA === null ? 1 : -1;

      return dateA < dateB ? -direction : dateA > dateB ? direction : 0;
    });
  }

  const pages = Math.max(1, Math.ceil(matches.length / POSTS_PER_PAGE));
  // Una página que se quedó sin filas —porque se archivó lo que había— cae en
  // la última que sí existe en vez de devolver el vacío.
  const current = Math.min(Math.max(1, Math.trunc(page)), pages);
  const slice = matches.slice((current - 1) * POSTS_PER_PAGE, current * POSTS_PER_PAGE);

  const now = new Date().toISOString();

  const items = slice.map(post => {
    // El español es el original: es el idioma en el que se escribe y el único
    // que se difunde. El título de la fila sale de ahí, y el inglés es la
    // traducción, que puede no existir todavía.
    const original = post.post_translations.find(t => t.locale === LIST_LOCALE);
    const publish = publishState(post.post_translations.map(t => t.published_at));

    // El link público existe sólo si esa traducción ya está viva: con fecha
    // futura la URL todavía no resuelve, y mandar a un 404 desde el panel no
    // dice nada sobre el artículo. Lo que no salió se mira por la vista previa.
    const live =
      original?.status === 'published' &&
      original.published_at !== null &&
      original.published_at <= now;

    return {
      key: post.key,
      title: original?.title ?? post.key,
      coverUrl: post.cover_path ? storageUrl(post.cover_path, BUCKETS.postMedia) : null,
      archived: post.archived_at !== null,
      publishedAt: publish.date,
      isLive: publish.published,
      liveUrl: live && original ? `/${LIST_LOCALE}/blog/${original.slug}` : null,
    };
  });

  return {
    items,
    matching: matches.length,
    counts,
    total: data.length,
    from: slice.length === 0 ? 0 : (current - 1) * POSTS_PER_PAGE + 1,
    pages,
    error: null,
  };
}
