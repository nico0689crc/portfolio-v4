'use server'

// Next Imports
import { redirect } from 'next/navigation'

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

export async function createPost(_prev: PostFormState, formData: FormData): Promise<PostFormState> {
  await requireAdmin()

  const parsed = key.safeParse(formData.get('key'))

  if (!parsed.success) return { error: parsed.error.issues[0].message, saved: false }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.from('posts').insert({ key: parsed.data })

  if (error) {
    return {
      error: error.code === '23505' ? 'Ya existe un post con esa clave.' : error.message,
      saved: false
    }
  }

  updateTags([TAGS.posts, TAGS.all])
  redirect(`/admin/posts/${parsed.data}`)
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

  updateTags([TAGS.posts, TAGS.post(postKey), TAGS.all])

  return { error: null, saved: true }
}

export async function deletePost(postKey: string): Promise<{ error: string | null }> {
  await requireAdmin()

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.from('posts').delete().eq('key', postKey)

  if (error) return { error: error.message }

  updateTags([TAGS.posts, TAGS.post(postKey), TAGS.all])
  redirect('/admin/posts')
}
