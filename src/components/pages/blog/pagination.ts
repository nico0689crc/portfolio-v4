import type { Tag } from "@/lib/content";

export type TagWithCount = Tag & { count: number };

/**
 * 3 columnas en desktop, así que un múltiplo de 3 evita una última fila
 * desbalanceada en la página más común (la primera, recién publicado).
 */
export const POSTS_PER_PAGE = 9;

/**
 * `href` de `next-intl`'s `Link`/`useRouter` para una página del listado.
 *
 * Sin dependencias de servidor a propósito: lo usan `TagFilter` y
 * `BlogPagination`, ambos client components, y arrastrar `@/lib/content` acá
 * —como pasó una vez con el barrel completo— rompe la compilación.
 */
export function blogListingHref(page: number, tagSlug?: string | null) {
  const query = tagSlug ? { tag: tagSlug } : undefined;

  return page > 1
    ? ({ pathname: "/blog/page/[page]", params: { page: String(page) }, query } as const)
    : ({ pathname: "/blog", query } as const);
}

/**
 * Rango de números de página a mostrar, con `"ellipsis"` donde se corta.
 *
 * Patrón estándar: primera, última, la actual y un vecino de cada lado;
 * el resto se colapsa. Con pocas páginas (el caso común acá) devuelve todas.
 */
export function paginationRange(current: number, total: number, siblings = 1): (number | "ellipsis")[] {
  const totalNumbers = siblings * 2 + 5;

  if (total <= totalNumbers) return Array.from({ length: total }, (_, i) => i + 1);

  const leftSibling = Math.max(current - siblings, 1);
  const rightSibling = Math.min(current + siblings, total);
  const showLeftEllipsis = leftSibling > 2;
  const showRightEllipsis = rightSibling < total - 1;

  if (!showLeftEllipsis && showRightEllipsis) {
    const leftRange = Array.from({ length: 3 + 2 * siblings }, (_, i) => i + 1);
    return [...leftRange, "ellipsis", total];
  }

  if (showLeftEllipsis && !showRightEllipsis) {
    const size = 3 + 2 * siblings;
    const rightRange = Array.from({ length: size }, (_, i) => total - size + i + 1);
    return [1, "ellipsis", ...rightRange];
  }

  const middleRange = Array.from({ length: rightSibling - leftSibling + 1 }, (_, i) => leftSibling + i);
  return [1, "ellipsis", ...middleRange, "ellipsis", total];
}
