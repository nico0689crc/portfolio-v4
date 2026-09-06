export const BUCKETS = {
  projectImages: 'project-images',
  /** Portadas e imágenes dentro del cuerpo: un solo bucket, un solo permiso. */
  postMedia: 'post-media'
} as const;

/**
 * Public URL for an object in one of the content buckets.
 *
 * The database stores paths (`mexx-ux-redesign/1.png`), never absolute URLs, so
 * that restoring a backup into a different Supabase project — or moving a
 * bucket behind a CDN — does not mean rewriting every row.
 */
export function storageUrl(path: string, bucket: string = BUCKETS.projectImages): string {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
}

/**
 * URL de la portada de una nota, o `null` si todavía no tiene una cargada.
 *
 * El null es el caso normal, no el excepcional: con la agenda cargada meses
 * adelante, toda nota a la que no se le generó la imagen está así. Quien
 * dibuja ese caso es `<DefaultCover />`, que es un SVG con la identidad del
 * sitio en vez de un hueco.
 */
export function coverSrc(
  cover: { coverPath: string | null; coverWidth: number | null; coverHeight: number | null }
): string | null {
  return cover.coverPath && cover.coverWidth && cover.coverHeight
    ? storageUrl(cover.coverPath, BUCKETS.postMedia)
    : null;
}
