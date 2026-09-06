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

/** La misma imagen que ya sirve de OG por defecto en el resto del sitio. */
export const DEFAULT_COVER = '/og/default.png';

/**
 * Portada de una nota, con respaldo cuando todavía no se subió ninguna.
 *
 * Antes la tarjeta simplemente no dibujaba la imagen, y una grilla donde
 * algunas tarjetas tienen foto y otras arrancan en el título se lee como rota,
 * no como sobria. Con la agenda cargada meses adelante eso deja de ser un caso
 * raro: hasta que se genere la portada, todas las notas futuras están así.
 */
export function coverSrc(
  cover: { coverPath: string | null; coverWidth: number | null; coverHeight: number | null }
): string {
  return cover.coverPath && cover.coverWidth && cover.coverHeight
    ? storageUrl(cover.coverPath, BUCKETS.postMedia)
    : DEFAULT_COVER;
}
