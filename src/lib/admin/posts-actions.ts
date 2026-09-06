'use server'

// Next Imports
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

// Third-party Imports
import { z } from 'zod'

// Lib Imports
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { updateTags } from '@/lib/content/cache'
import { TAGS } from '@/lib/content/tags'
import { requireAdmin } from './auth'
import { slugify } from '@/lib/slug'

export type PostFormState = {
  error: string | null
  saved: boolean
}

const LOCALES = ['es', 'en'] as const

/** Ritmo de lectura habitual para prosa en español e inglés. */
const WORDS_PER_MINUTE = 200

const key = z
  .string()
  .trim()
  .min(1, 'La clave no puede estar vacía')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Sólo minúsculas, números y guiones')

const slug = key

/**
 * Claves que chocarían con una ruta del panel.
 *
 * `/admin/posts/nuevo` es una pantalla, así que un artículo con esa clave sería
 * inalcanzable para editar: Next resuelve el segmento estático antes que el
 * dinámico y el editor nunca llegaría a su propio post.
 */
const RESERVED_KEYS = ['nuevo', 'new']

/**
 * Crea el post a partir de los títulos.
 *
 * La clave y los slugs se derivan y no se piden: son detalles de URL que el
 * editor no tiene por qué inventar, y pedirlos convertía la pantalla de alta en
 * un formulario técnico que no parecía servir para escribir un artículo. Los
 * dos siguen siendo editables después.
 */
export async function createPost(_prev: PostFormState, formData: FormData): Promise<PostFormState> {
  await requireAdmin()

  const titles = {
    es: String(formData.get('es.title') ?? '').trim(),
    en: String(formData.get('en.title') ?? '').trim()
  }

  if (!titles.es) return { error: 'El título en español es obligatorio.', saved: false }

  const derived = slugify(titles.es)

  if (!derived) return { error: 'Ese título no genera una URL válida. Usá letras o números.', saved: false }

  const parsed = key.safeParse(derived)

  if (!parsed.success) return { error: parsed.error.issues[0].message, saved: false }
  if (RESERVED_KEYS.includes(parsed.data)) {
    return { error: 'Ese título genera una URL reservada. Cambiá alguna palabra.', saved: false }
  }

  const supabase = await createSupabaseServerClient()

  const { data: post, error } = await supabase
    .from('posts')
    .insert({ key: parsed.data })
    .select('id')
    .single()

  if (error) {
    return {
      error:
        error.code === '23505'
          ? 'Ya existe un artículo con ese título. Cambiá alguna palabra.'
          : error.message,
      saved: false
    }
  }

  // Nace como borrador en los dos idiomas: crear no es publicar, y un artículo
  // que apareciera en el sitio apenas se le pone título sería una trampa.
  const rows = LOCALES.filter(locale => titles[locale]).map(locale => ({
    post_id: post.id,
    locale,
    slug: slugify(titles[locale]),
    title: titles[locale],
    excerpt: '',
    body: '',
    status: 'draft' as const
  }))

  if (rows.length > 0) {
    const { error: translationError } = await supabase.from('post_translations').insert(rows)

    if (translationError) {
      // Sin traducciones el post es una fila huérfana que nadie puede editar.
      await supabase.from('posts').delete().eq('id', post.id)

      return { error: `No se pudo crear: ${translationError.message}`, saved: false }
    }
  }

  updateTags([TAGS.posts, TAGS.all])
  redirect(`/admin/posts/${parsed.data}`)
}

/** Archiva o restaura. Es una fecha, así que restaurar es ponerla en null. */
export async function setPostArchived(postKey: string, archived: boolean): Promise<{ error: string | null }> {
  await requireAdmin()

  const supabase = await createSupabaseServerClient()

  const { error } = await supabase
    .from('posts')
    .update({ archived_at: archived ? new Date().toISOString() : null })
    .eq('key', postKey)

  if (error) return { error: error.message }

  updateTags([TAGS.posts, TAGS.post(postKey), TAGS.all])
  revalidatePath('/admin/posts')

  return { error: null }
}

/**
 * `reading_minutes` y `word_count` se calculan acá y no se piden al editor.
 * Son datos derivados del cuerpo: si se escribieran a mano quedarían
 * desactualizados en la primera corrección, y nadie se enteraría porque no
 * rompen nada — sólo mienten.
 */
function measure(body: string) {
  const words = body.trim().split(/\s+/).filter(Boolean).length

  return { word_count: words, reading_minutes: Math.max(1, Math.round(words / WORDS_PER_MINUTE)) }
}

export async function updatePost(
  postKey: string,
  _prev: PostFormState,
  formData: FormData
): Promise<PostFormState> {
  await requireAdmin()

  const supabase = await createSupabaseServerClient()
  const { data: post } = await supabase.from('posts').select('id').eq('key', postKey).maybeSingle()

  if (!post) return { error: 'No se encontró el post.', saved: false }

  const rows = []

  for (const locale of LOCALES) {
    const parsedSlug = slug.safeParse(formData.get(`${locale}.slug`))

    if (!parsedSlug.success) {
      return { error: `${locale.toUpperCase()}: ${parsedSlug.error.issues[0].message}`, saved: false }
    }

    const title = String(formData.get(`${locale}.title`) ?? '').trim()

    if (!title) return { error: `${locale.toUpperCase()}: falta el título.`, saved: false }

    const body = String(formData.get(`${locale}.body`) ?? '')
    const status = formData.get(`${locale}.status`) === 'published' ? 'published' : 'draft'
    const publishedAt = String(formData.get(`${locale}.published_at`) ?? '').trim()

    rows.push({
      post_id: post.id,
      locale,
      slug: parsedSlug.data,
      title,
      // Los campos SEO son overrides: vacío significa "usá el visible", no
      // "dejá el <title> en blanco".
      seo_title: String(formData.get(`${locale}.seo_title`) ?? '').trim() || null,
      seo_description: String(formData.get(`${locale}.seo_description`) ?? '').trim() || null,
      og_image: String(formData.get(`${locale}.og_image`) ?? '').trim() || null,
      cover_alt: String(formData.get(`${locale}.cover_alt`) ?? '').trim() || null,
      excerpt: String(formData.get(`${locale}.excerpt`) ?? '').trim() || null,
      body,
      status,
      // Un post publicado sin fecha se ordena de forma impredecible en el
      // listado, así que si falta se toma la de ahora.
      published_at: publishedAt ? new Date(publishedAt).toISOString() : status === 'published' ? new Date().toISOString() : null,
      content_updated_at: new Date().toISOString(),
      noindex: formData.get(`${locale}.noindex`) === 'on',
      ...measure(body)
    })
  }

  const { error } = await supabase
    .from('post_translations')
    .upsert(rows as never, { onConflict: 'post_id,locale' })

  if (error) {
    return {
      error: error.code === '23505' ? 'Ese slug ya lo usa otro post en el mismo idioma.' : error.message,
      saved: false
    }
  }

  // Los tags son una relación, no una columna: se reemplaza el conjunto entero
  // en vez de calcular altas y bajas. Con un puñado de filas por post es más
  // simple y no deja huérfanos si el navegador manda una lista incompleta.
  const tagIds: string[] = JSON.parse(String(formData.get('tagIds') ?? '[]'))

  await supabase.from('post_tags').delete().eq('post_id', post.id)

  if (tagIds.length > 0) {
    const { error: tagError } = await supabase
      .from('post_tags')
      .insert(tagIds.map(tagId => ({ post_id: post.id, tag_id: tagId })))

    if (tagError) return { error: `No se pudieron guardar los tags: ${tagError.message}`, saved: false }
  }

  updateTags([TAGS.posts, TAGS.post(postKey), TAGS.tags, TAGS.all])

  return { error: null, saved: true }
}

export async function deletePost(postKey: string): Promise<{ error: string | null }> {
  await requireAdmin()

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.from('posts').delete().eq('key', postKey)

  if (error) return { error: error.message }

  updateTags([TAGS.posts, TAGS.post(postKey), TAGS.all])
  // Sin esto, borrar desde el propio listado redirige a la misma ruta y el
  // navegador vuelve a mostrar la fila que ya no existe.
  revalidatePath('/admin/posts')
  redirect('/admin/posts')
}
