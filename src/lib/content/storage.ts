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
