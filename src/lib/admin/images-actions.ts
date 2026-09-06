'use server'

// Third-party Imports
import sharp from 'sharp'

// Lib Imports
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { updateTags } from '@/lib/content/cache'
import { TAGS } from '@/lib/content/tags'
import { requireAdmin } from './auth'

export type ImagesFormState = {
  error: string | null
  saved: boolean
}

const LOCALES = ['es', 'en'] as const
const BUCKET = 'project-images'
/** Tiene que coincidir con `serverActions.bodySizeLimit`: Next rechaza antes que esto. */
const MAX_BYTES = 2 * 1024 * 1024

/**
 * Mismo placeholder que genera el script de carga: un JPEG de 16px de ancho
 * embebido como data URL. Sin el, una imagen subida desde el panel se veria
 * distinta a las que ya estan —salto de layout en vez de un blur— y nadie
 * relacionaria la diferencia con por donde entro el archivo.
 */
async function blurDataUrl(buffer: Buffer) {
  const tiny = await sharp(buffer).resize(16).jpeg({ quality: 40 }).toBuffer()

  return `data:image/jpeg;base64,${tiny.toString('base64')}`
}

export async function saveImages(
  projectKey: string,
  _prev: ImagesFormState,
  formData: FormData
): Promise<ImagesFormState> {
  await requireAdmin()

  const supabase = await createSupabaseServerClient()

  const { data: project } = await supabase.from('projects').select('id').eq('key', projectKey).maybeSingle()

  if (!project) return { error: 'No se encontró el proyecto.', saved: false }

  const ids: string[] = JSON.parse(String(formData.get('ids') ?? '[]'))
  const deleted: string[] = JSON.parse(String(formData.get('deleted') ?? '[]'))

  if (ids.length > 0) {
    const { error } = await supabase
      .from('project_images')
      .upsert(
        ids.map((id, index) => ({ id, project_id: project.id, sort_order: index })) as never,
        { onConflict: 'id' }
      )

    if (error) return { error: `No se pudo guardar el orden: ${error.message}`, saved: false }

    const alts = ids.flatMap(id =>
      LOCALES.map(locale => ({
        image_id: id,
        locale,
        alt: String(formData.get(`${id}.${locale}.alt`) ?? '').trim() || null
      }))
    )

    const { error: altError } = await supabase
      .from('project_image_translations')
      .upsert(alts as never, { onConflict: 'image_id,locale' })

    if (altError) return { error: `No se pudo guardar el alt: ${altError.message}`, saved: false }
  }

  // Se borra la fila y el objeto. Dejar el archivo huerfano en Storage seria
  // invisible hasta que la factura o el limite del bucket lo hagan visible.
  if (deleted.length > 0) {
    const { data: rows } = await supabase
      .from('project_images')
      .select('storage_path')
      .in('id', deleted)

    const { error } = await supabase.from('project_images').delete().in('id', deleted)

    if (error) return { error: `No se pudo eliminar: ${error.message}`, saved: false }

    if (rows && rows.length > 0) {
      await supabase.storage.from(BUCKET).remove(rows.map(row => row.storage_path))
    }
  }

  updateTags([TAGS.projects, TAGS.project(projectKey), TAGS.all])

  return { error: null, saved: true }
}

export async function uploadImage(
  projectKey: string,
  _prev: ImagesFormState,
  formData: FormData
): Promise<ImagesFormState> {
  await requireAdmin()

  const file = formData.get('file')

  if (!(file instanceof File) || file.size === 0) return { error: 'Elegí un archivo.', saved: false }
  if (file.size > MAX_BYTES) return { error: 'El archivo supera los 2 MB.', saved: false }

  const supabase = await createSupabaseServerClient()

  const { data: project } = await supabase.from('projects').select('id').eq('key', projectKey).maybeSingle()

  if (!project) return { error: 'No se encontró el proyecto.', saved: false }

  const buffer = Buffer.from(await file.arrayBuffer())

  let width: number | undefined
  let height: number | undefined

  try {
    ({ width, height } = await sharp(buffer).metadata())
  } catch {
    return { error: 'No parece una imagen válida.', saved: false }
  }

  if (!width || !height) return { error: 'No se pudieron leer las dimensiones.', saved: false }

  // El nombre lleva un sufijo aleatorio para que subir dos veces un archivo con
  // el mismo nombre no pise silenciosamente al anterior, que sigue referenciado
  // por su fila.
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '-').toLowerCase()
  const storagePath = `${projectKey}/${crypto.randomUUID().slice(0, 8)}-${safeName}`

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(storagePath, buffer, {
    contentType: file.type || 'image/png',
    cacheControl: '31536000'
  })

  if (uploadError) return { error: `No se pudo subir: ${uploadError.message}`, saved: false }

  const { count } = await supabase
    .from('project_images')
    .select('*', { count: 'exact', head: true })
    .eq('project_id', project.id)

  const { error } = await supabase.from('project_images').insert({
    project_id: project.id,
    storage_path: storagePath,
    width,
    height,
    blur_data_url: await blurDataUrl(buffer),
    sort_order: count ?? 0
  })

  if (error) {
    // La fila fallo, asi que el objeto recien subido no lo referencia nadie.
    await supabase.storage.from(BUCKET).remove([storagePath])

    return { error: `No se pudo registrar: ${error.message}`, saved: false }
  }

  updateTags([TAGS.projects, TAGS.project(projectKey), TAGS.all])

  return { error: null, saved: true }
}
