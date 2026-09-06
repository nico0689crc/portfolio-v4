'use server'

// Third-party Imports
import sharp from 'sharp'

// Lib Imports
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { updateTags } from '@/lib/content/cache'
import { TAGS } from '@/lib/content/tags'
import { BUCKETS } from '@/lib/content/storage'
import { requireAdmin } from './auth'

export type MediaFormState = {
  error: string | null
  /** Snippet markdown de la última imagen subida, para pegar en el cuerpo. */
  snippet: string | null
  saved: boolean
}

/** Tiene que coincidir con `serverActions.bodySizeLimit`: Next rechaza antes que esto. */
const MAX_BYTES = 2 * 1024 * 1024
const ACCEPTED = ['image/png', 'image/jpeg', 'image/webp', 'image/avif']

/** Mismo placeholder que el resto del sitio: un JPEG de 16px como data URL. */
async function blurDataUrl(buffer: Buffer) {
  const tiny = await sharp(buffer).resize(16).jpeg({ quality: 40 }).toBuffer()

  return `data:image/jpeg;base64,${tiny.toString('base64')}`
}

type ReadResult =
  | { ok: false; error: string }
  | { ok: true; buffer: Buffer; width: number; height: number; file: File }

async function readImage(formData: FormData): Promise<ReadResult> {
  const file = formData.get('file')

  if (!(file instanceof File) || file.size === 0) return { ok: false, error: 'Elegí un archivo.' }
  if (file.size > MAX_BYTES) return { ok: false, error: 'El archivo supera los 2 MB.' }
  if (file.type && !ACCEPTED.includes(file.type)) return { ok: false, error: 'Formato no soportado.' }

  const buffer = Buffer.from(await file.arrayBuffer())

  try {
    const { width, height } = await sharp(buffer).metadata()

    if (!width || !height) return { ok: false, error: 'No se pudieron leer las dimensiones.' }

    return { ok: true, buffer, width, height, file }
  } catch {
    return { ok: false, error: 'No parece una imagen válida.' }
  }
}

/** Nombre con sufijo aleatorio: subir dos veces `captura.png` no pisa la anterior. */
function storagePathFor(postKey: string, name: string, prefix = '') {
  const safe = name.replace(/[^a-zA-Z0-9.-]/g, '-').toLowerCase()

  return `${postKey}/${prefix}${crypto.randomUUID().slice(0, 8)}-${safe}`
}

export async function uploadCover(
  postKey: string,
  _prev: MediaFormState,
  formData: FormData
): Promise<MediaFormState> {
  await requireAdmin()

  const image = await readImage(formData)

  if (!image.ok) return { error: image.error, snippet: null, saved: false }

  const supabase = await createSupabaseServerClient()

  const { data: post } = await supabase
    .from('posts')
    .select('id, cover_path')
    .eq('key', postKey)
    .maybeSingle()

  if (!post) return { error: 'No se encontró el post.', snippet: null, saved: false }

  const path = storagePathFor(postKey, image.file.name, 'cover-')

  const { error: uploadError } = await supabase.storage
    .from(BUCKETS.postMedia)
    .upload(path, image.buffer, { contentType: image.file.type || 'image/png', cacheControl: '31536000' })

  if (uploadError) return { error: `No se pudo subir: ${uploadError.message}`, snippet: null, saved: false }

  const { error } = await supabase
    .from('posts')
    .update({
      cover_path: path,
      cover_width: image.width,
      cover_height: image.height,
      cover_blur_data_url: await blurDataUrl(image.buffer)
    })
    .eq('id', post.id)

  if (error) {
    await supabase.storage.from(BUCKETS.postMedia).remove([path])

    return { error: `No se pudo registrar: ${error.message}`, snippet: null, saved: false }
  }

  // La portada anterior se borra recién cuando la nueva quedó registrada: si
  // fallara al revés, el post quedaría apuntando a un archivo que ya no está.
  if (post.cover_path) await supabase.storage.from(BUCKETS.postMedia).remove([post.cover_path])

  updateTags([TAGS.posts, TAGS.post(postKey), TAGS.all])

  return { error: null, snippet: null, saved: true }
}

/**
 * Imagen para el cuerpo del artículo.
 *
 * No toca ninguna tabla: devuelve el markdown para pegar. El cuerpo es la única
 * fuente de verdad de qué imágenes usa una nota, y llevar además un registro
 * paralelo garantizaría que los dos se desincronicen en la primera edición.
 */
export async function uploadBodyImage(
  postKey: string,
  _prev: MediaFormState,
  formData: FormData
): Promise<MediaFormState> {
  await requireAdmin()

  const image = await readImage(formData)

  if (!image.ok) return { error: image.error, snippet: null, saved: false }

  const supabase = await createSupabaseServerClient()

  const path = storagePathFor(postKey, image.file.name)

  const { error } = await supabase.storage
    .from(BUCKETS.postMedia)
    .upload(path, image.buffer, { contentType: image.file.type || 'image/png', cacheControl: '31536000' })

  if (error) return { error: `No se pudo subir: ${error.message}`, snippet: null, saved: false }

  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKETS.postMedia}/${path}`

  // El alt queda vacío a propósito, para que se note que falta escribirlo.
  return { error: null, snippet: `![](${url})`, saved: true }
}
