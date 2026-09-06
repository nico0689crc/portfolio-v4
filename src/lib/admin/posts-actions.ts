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
 * Crea el artículo completo desde un solo formulario.
 *
 * No hay paso previo que pida sólo el título: es el mismo formulario que la
 * edición, y partirlo en dos obligaba a guardar algo incompleto para llegar a
 * los campos que faltaban.
 *
 * La clave sale del slug en español y no de un campo propio. Es un
 * identificador interno que nunca aparece en una URL, así que pedirlo sería
 * pedirle al editor que invente un dato que no le importa a nadie.
 */
export async function createPost(_prev: PostFormState, formData: FormData): Promise<PostFormState> {
  await requireAdmin()

  // La clave sale del slug en castellano, o del inglés si la nota se escribió
  // sólo en ese idioma. Es un identificador interno que nunca aparece en una
  // URL: pedirlo sería pedirle al editor que invente un dato que no le importa
  // a nadie, y atarlo a un único idioma impediría empezar por el otro.
  const candidate =
    String(formData.get('es.slug') ?? '').trim() || String(formData.get('en.slug') ?? '').trim()

  const parsedSlug = slug.safeParse(candidate)

  if (!parsedSlug.success) {
    return { error: `Slug: ${parsedSlug.error.issues[0].message}`, saved: false }
  }

  const derivedKey = parsedSlug.data

  if (RESERVED_KEYS.includes(derivedKey)) {
    return { error: 'Ese slug es una ruta reservada del panel. Cambialo.', saved: false }
  }

  const supabase = await createSupabaseServerClient()

  const { data: post, error } = await supabase
    .from('posts')
    .insert({ key: derivedKey })
    .select('id')
    .single()

  if (error) {
    return {
      error: error.code === '23505' ? 'Ya existe un artículo con ese slug.' : error.message,
      saved: false
    }
  }

  const parsed = parseTranslations(formData, post.id)

  // Todo lo que sigue puede fallar dejando una fila de `posts` sin
  // traducciones, que es un artículo que el panel lista y nadie puede editar.
  // Por eso cada salida borra el padre antes de volver.
  if ('error' in parsed) {
    await supabase.from('posts').delete().eq('id', post.id)

    return { error: parsed.error, saved: false }
  }

  const { error: translationError } = await supabase
    .from('post_translations')
    .insert(parsed.rows as never)

  if (translationError) {
    await supabase.from('posts').delete().eq('id', post.id)

    return {
      error:
        translationError.code === '23505'
          ? 'Ese slug ya lo usa otro artículo en el mismo idioma.'
          : translationError.message,
      saved: false
    }
  }

  const tagError = await saveTags(supabase, post.id, formData)

  if (tagError) return { error: `No se pudieron guardar los tags: ${tagError}`, saved: false }

  updateTags([TAGS.posts, TAGS.tags, TAGS.all])
  revalidatePath('/admin/posts')
  // Se va al editor y no al listado: recién ahí se puede subir la portada, que
  // necesita que el post exista para saber dónde guardar el archivo.
  redirect(`/admin/posts/${derivedKey}`)
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

type TranslationRow = Record<string, unknown>

/**
 * Las filas de traducción a partir del formulario.
 *
 * Compartida entre el alta y la edición: son el mismo formulario, y dos
 * parseos separados terminan validando distinto — el alta aceptando algo que
 * la edición rechaza, o guardando un campo que la otra olvida.
 */
function parseTranslations(
  formData: FormData,
  postId: string
): { rows: TranslationRow[] } | { error: string } {
  const rows: TranslationRow[] = []

  for (const locale of LOCALES) {
    const title = String(formData.get(`${locale}.title`) ?? '').trim()

    // Un idioma sin título se omite en vez de rechazarse: escribir primero en
    // castellano y traducir después es el flujo normal, y `getPostSlugMap` ya
    // omite los idiomas sin fila —esa ausencia es justamente la garantía de
    // hreflang, porque declarar una versión que no existe tira abajo el clúster
    // entero, incluido el idioma que sí está.
    if (!title) continue

    const parsedSlug = slug.safeParse(formData.get(`${locale}.slug`))

    if (!parsedSlug.success) {
      return { error: `${locale.toUpperCase()}: ${parsedSlug.error.issues[0].message}` }
    }

    const body = String(formData.get(`${locale}.body`) ?? '')
    const status = formData.get(`${locale}.status`) === 'published' ? 'published' : 'draft'
    const publishedAt = String(formData.get(`${locale}.published_at`) ?? '').trim()

    rows.push({
      post_id: postId,
      locale,
      slug: parsedSlug.data,
      title,
      // Los campos SEO son overrides: vacío significa "usá el visible", no
      // "dejá el <title> en blanco".
      focus_keyphrase: String(formData.get(`${locale}.focus_keyphrase`) ?? '').trim() || null,
      og_title: String(formData.get(`${locale}.og_title`) ?? '').trim() || null,
      og_description: String(formData.get(`${locale}.og_description`) ?? '').trim() || null,
      seo_title: String(formData.get(`${locale}.seo_title`) ?? '').trim() || null,
      seo_description: String(formData.get(`${locale}.seo_description`) ?? '').trim() || null,
      og_image: String(formData.get(`${locale}.og_image`) ?? '').trim() || null,
      cover_alt: String(formData.get(`${locale}.cover_alt`) ?? '').trim() || null,
      excerpt: String(formData.get(`${locale}.excerpt`) ?? '').trim() || null,
      body,
      status,
      // Un post publicado sin fecha se ordena de forma impredecible en el
      // listado, así que si falta se toma la de ahora.
      published_at: publishedAt
        ? new Date(publishedAt).toISOString()
        : status === 'published'
          ? new Date().toISOString()
          : null,
      content_updated_at: new Date().toISOString(),
      noindex: formData.get(`${locale}.noindex`) === 'on',
      ...measure(body)
    })
  }

  if (rows.length === 0) return { error: 'Escribí al menos el título de un idioma.' }

  return { rows }
}

/** Reemplaza el conjunto de tags del post. */
async function saveTags(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  postId: string,
  formData: FormData
) {
  const tagIds: string[] = JSON.parse(String(formData.get('tagIds') ?? '[]'))

  await supabase.from('post_tags').delete().eq('post_id', postId)

  if (tagIds.length === 0) return null

  const { error } = await supabase
    .from('post_tags')
    .insert(tagIds.map(tagId => ({ post_id: postId, tag_id: tagId })))

  return error?.message ?? null
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

  const parsed = parseTranslations(formData, post.id)

  if ('error' in parsed) return { error: parsed.error, saved: false }

  const rows = parsed.rows

  const { error } = await supabase
    .from('post_translations')
    .upsert(rows as never, { onConflict: 'post_id,locale' })

  if (error) {
    return {
      error: error.code === '23505' ? 'Ese slug ya lo usa otro post en el mismo idioma.' : error.message,
      saved: false
    }
  }

  const tagError = await saveTags(supabase, post.id, formData)

  if (tagError) return { error: `No se pudieron guardar los tags: ${tagError}`, saved: false }

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
