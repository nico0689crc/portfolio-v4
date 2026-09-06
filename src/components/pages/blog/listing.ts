import { getPosts } from "@/lib/content";
import type { PostSummary } from "@/lib/content";
import { localizedUrl } from "@/lib/seo";
import { POSTS_PER_PAGE, type TagWithCount } from "./pagination";

export { POSTS_PER_PAGE };

export type BlogListing = {
  posts: PostSummary[];
  tags: TagWithCount[];
  /** `null` cuando no hay filtro o el slug no matchea ningún tag conocido. */
  activeTag: TagWithCount | null;
  currentPage: number;
  totalPages: number;
  totalPosts: number;
};

function countTags(posts: PostSummary[]): TagWithCount[] {
  const seen = new Map<string, TagWithCount>();

  for (const post of posts) {
    for (const tag of post.tags) {
      const entry = seen.get(tag.key);

      if (entry) entry.count += 1;
      else seen.set(tag.key, { ...tag, count: 1 });
    }
  }

  return [...seen.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

/**
 * Resuelve una página del listado: qué notas mostrar, los tags con su conteo
 * (siempre sobre el set completo, así cambiar de filtro nunca muestra un
 * conteo viejo) y si `page`/`tagSlug` son válidos.
 *
 * Devuelve `null` para una página fuera de rango en vez de recortarla en
 * silencio: una página 40 que en realidad muestra la 3 es una trampa de
 * contenido duplicado, mejor un 404 que el visitante y el crawler entienden.
 */
export async function getBlogListing(
  locale: string,
  page: number,
  tagSlug?: string
): Promise<BlogListing | null> {
  if (!Number.isInteger(page) || page < 1) return null;

  const posts = await getPosts(locale);
  const tags = countTags(posts);

  const activeTag = (tagSlug && tags.find((tag) => tag.slug === tagSlug)) || null;
  const filtered = activeTag ? posts.filter((post) => post.tags.some((tag) => tag.key === activeTag.key)) : posts;

  const totalPosts = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalPosts / POSTS_PER_PAGE));

  if (page > totalPages) return null;

  const start = (page - 1) * POSTS_PER_PAGE;

  return {
    posts: filtered.slice(start, start + POSTS_PER_PAGE),
    tags,
    activeTag,
    currentPage: page,
    totalPages,
    totalPosts
  };
}

/**
 * URL absoluta y canónica de una página del listado (paginado + filtro
 * incluidos).
 *
 * El filtro por tag no tiene alternates por idioma propios acá a propósito:
 * el slug de un tag es distinto por locale, y sin esa tabla de equivalencias
 * un hreflang armado a mano terminaría apuntando a una URL que no existe en
 * el otro idioma.
 */
export function blogListingUrl(locale: string, page: number, tagSlug?: string | null): string {
  const href =
    page > 1 ? ({ pathname: "/blog/page/[page]", params: { page: String(page) } } as const) : ("/blog" as const);
  const url = localizedUrl(locale, href);

  return tagSlug ? `${url}?tag=${encodeURIComponent(tagSlug)}` : url;
}
