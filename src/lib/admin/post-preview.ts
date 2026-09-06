// Lib Imports
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { PostDetail, Tag } from '@/lib/content/types'

/**
 * Un post tal como lo vería el sitio, incluidos los borradores.
 *
 * No usa `getPost()` porque aquel lee con el cliente anónimo, que filtra por
 * `status = 'published'` — que es exactamente lo correcto en público y lo
 * inservible para una vista previa. Acá se lee con la sesión del editor, y la
 * policy `post_translations_admin_all` es la que habilita ver el borrador.
 *
 * Tampoco pasa por el cache de contenido: una vista previa que sirva la versión
 * cacheada del guardado anterior no sirve para revisar lo que se acaba de
 * escribir.
 */
export async function getPostPreview(key: string, locale: string): Promise<PostDetail | null> {
  const supabase = await createSupabaseServerClient()

  const { data } = await supabase
    .from('posts')
    .select(
      `key, cover_path, cover_width, cover_height, cover_blur_data_url,
       post_tags(tags(key, tag_translations(locale, slug, name))),
       post_translations(locale, slug, title, excerpt, body, published_at, content_updated_at,
                         reading_minutes, word_count, noindex, seo_title, seo_description,
                         og_image, cover_alt)`
    )
    .eq('key', key)
    .maybeSingle()

  if (!data) return null

  const t = data.post_translations.find(row => row.locale === locale)

  if (!t) return null

  const tags: Tag[] = data.post_tags.flatMap(pt => {
    const translation = pt.tags.tag_translations.find(row => row.locale === locale)

    return translation ? [{ key: pt.tags.key, slug: translation.slug, name: translation.name }] : []
  })

  return {
    key: data.key,
    slug: t.slug,
    title: t.title,
    excerpt: t.excerpt,
    body: t.body,
    publishedAt: t.published_at,
    contentUpdatedAt: t.content_updated_at,
    readingMinutes: t.reading_minutes,
    wordCount: t.word_count,
    coverPath: data.cover_path,
    coverWidth: data.cover_width,
    coverHeight: data.cover_height,
    coverBlurDataUrl: data.cover_blur_data_url,
    noindex: t.noindex,
    seoTitle: t.seo_title,
    seoDescription: t.seo_description,
    ogImage: t.og_image,
    coverAlt: t.cover_alt,
    tags
  }
}
