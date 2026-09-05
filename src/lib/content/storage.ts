const BUCKET = 'project-images';

/**
 * Public URL for an object in the project images bucket.
 *
 * The database stores paths (`mexx-ux-redesign/1.png`), never absolute URLs, so
 * that restoring a backup into a different Supabase project — or moving the
 * bucket behind a CDN — does not mean rewriting every row.
 */
export function storageUrl(path: string): string {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
}
