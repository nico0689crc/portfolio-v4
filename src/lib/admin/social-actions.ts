'use server'

// Next Imports
import { revalidatePath } from 'next/cache'

// Third-party Imports
import { z } from 'zod'

// Lib Imports
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { BUCKETS, storageUrl } from '@/lib/content/storage'
import { deliverShare, getDeliveryConfig } from '@/lib/social/deliver'
import { SHARE_LOCALE, type ShareAsset } from '@/lib/social/shares'
import { requireAdmin } from './auth'

export type ShareFormState = { error: string | null; saved: boolean }

/**
 * El bucket acepta 25 MB, pero el PDF viaja por un server action y ahí manda
 * `serverActions.bodySizeLimit`, que está en 2 MB. Para levantar el techo el
 * archivo tendría que subirse del navegador directo a Storage, sin pasar por
 * el server — que además es lo correcto para algo de ese tamaño.
 */
const MAX_PDF_BYTES = 2 * 1024 * 1024

type SupabaseClient = Awaited<ReturnType<typeof createSupabaseServerClient>>

/**
 * Resuelve la media del envío a partir de lo que eligió el editor.
 *
 * `null` es "automático": el cron adjunta la portada vigente del artículo al
 * entregar, en vez de congelar la que había el día que se programó.
 *
 * El default del panel es `article` —la tarjeta de enlace—, que es lo único que
 * hace clickeable el link: la Posts API no scrapea la URL, así que sin tarjeta
 * el link queda como texto suelto.
 *
 * El carrusel es un PDF y no varias imágenes: LinkedIn eliminó el carrusel
 * multi-imagen nativo, y hoy lo que se ve deslizable es un documento paginado.
 */
async function resolveFormAssets(
  supabase: SupabaseClient,
  formData: FormData,
  postId: string,
  current: ShareAsset[] | null
): Promise<{ error: string } | { assets: ShareAsset[] | null }> {
  const media = String(formData.get('media') ?? 'auto')

  if (media === 'auto') return { assets: null }
  if (media === 'none') return { assets: [] }
  // Se guarda como marca sin datos: el título, la bajada y la miniatura los
  // completa `deliverShare` al publicar, con lo vigente en ese momento.
  if (media === 'article') return { assets: [{ kind: 'article' }] }

  const file = formData.get('document')
  const hasFile = file instanceof File && file.size > 0

  // Editar un envío que ya tiene el PDF cargado sin volver a subirlo.
  if (!hasFile) {
    const kept = current?.filter(a => a.kind === 'document') ?? []

    return kept.length > 0 ? { assets: kept } : { error: 'Elegí el PDF del carrusel.' }
  }

  if (file.type !== 'application/pdf') return { error: 'El carrusel tiene que ser un PDF.' }
  if (file.size > MAX_PDF_BYTES) return { error: 'El PDF supera los 2 MB.' }

  const { data: post } = await supabase
    .from('post_translations')
    .select('title, posts!inner(key, cover_path)')
    .eq('post_id', postId)
    .eq('locale', SHARE_LOCALE)
    .maybeSingle()

  if (!post) return { error: 'No se encontró el artículo.' }

  // Buffer exige `thumbnailUrl` en un documento y no la genera solo. Se usa la
  // portada del artículo, que ya está en el bucket público: pedir una imagen
  // aparte sería pedir dos veces lo mismo.
  if (!post.posts.cover_path) {
    return { error: 'El carrusel necesita miniatura. Subí primero la portada del artículo.' }
  }

  const safe = file.name.replace(/[^a-zA-Z0-9.-]/g, '-').toLowerCase()
  const path = `${post.posts.key}/carousel-${crypto.randomUUID().slice(0, 8)}-${safe}`

  const { error: uploadError } = await supabase.storage
    .from(BUCKETS.postMedia)
    .upload(path, Buffer.from(await file.arrayBuffer()), {
      contentType: 'application/pdf',
      cacheControl: '31536000'
    })

  if (uploadError) return { error: `No se pudo subir el PDF: ${uploadError.message}` }

  return {
    assets: [
      {
        kind: 'document',
        url: storageUrl(path, BUCKETS.postMedia),
        title: post.title,
        thumbnailUrl: storageUrl(post.posts.cover_path, BUCKETS.postMedia)
      }
    ]
  }
}

const schema = z.object({
  postId: z.string().uuid('Artículo inválido'),
  // `datetime-local` no manda zona, así que llega "2026-09-08T09:00". Se
  // interpreta en el huso del server —UTC en Vercel— salvo que se le pegue el
  // offset local que el formulario manda aparte.
  scheduledAt: z.string().min(1, 'Falta la fecha'),
  message: z.string().trim().max(3000, 'LinkedIn corta a los 3000 caracteres')
})

/** Une lo que escribió el editor con el offset de su navegador. */
const toInstant = (local: string, offset: string) => {
  const parsed = new Date(/[Zz]|[+-]\d\d:\d\d$/.test(local) ? local : `${local}:00${offset}`)

  return Number.isNaN(parsed.getTime()) ? null : parsed
}

const parse = (formData: FormData) => {
  const result = schema.safeParse({
    postId: String(formData.get('post_id') ?? ''),
    scheduledAt: String(formData.get('scheduled_at') ?? ''),
    message: String(formData.get('message') ?? '')
  })

  if (!result.success) return { error: result.error.issues[0].message, value: null }

  const at = toInstant(result.data.scheduledAt, String(formData.get('tz_offset') ?? 'Z'))

  if (!at) return { error: 'La fecha no es válida', value: null }

  return { error: null, value: { ...result.data, at } }
}

/**
 * Programa un envío.
 *
 * `message` vacío se guarda como null a propósito: así el texto se arma recién
 * al entregar y toma el título vigente, en vez de congelar una copia el día que
 * se agendó.
 */
export async function scheduleShare(formData: FormData): Promise<ShareFormState> {
  await requireAdmin()

  const { error: invalid, value } = parse(formData)

  if (!value) return { error: invalid, saved: false }

  const supabase = await createSupabaseServerClient()
  const media = await resolveFormAssets(supabase, formData, value.postId, null)

  if ('error' in media) return { error: media.error, saved: false }

  const { error } = await supabase.from('post_social_shares').insert({
    post_id: value.postId,
    locale: SHARE_LOCALE,
    scheduled_at: value.at.toISOString(),
    message: value.message || null,
    assets: media.assets,
    link_in_first_comment: formData.get('link_in_first_comment') === 'on'
  })

  if (error) {
    // El índice parcial `post_social_shares_pending_idx` es lo que impide
    // agendar dos veces la misma nota; el mensaje crudo de Postgres no le dice
    // nada a nadie.
    return {
      error: error.code === '23505' ? 'Ese artículo ya tiene un envío programado' : error.message,
      saved: false
    }
  }

  revalidatePath('/admin/linkedin')

  return { error: null, saved: true }
}

/** Cambia fecha o texto de un envío que todavía no salió. */
export async function updateShare(formData: FormData): Promise<ShareFormState> {
  await requireAdmin()

  const id = String(formData.get('id') ?? '')
  const { error: invalid, value } = parse(formData)

  if (!value) return { error: invalid, saved: false }

  const supabase = await createSupabaseServerClient()

  const { data: existing } = await supabase
    .from('post_social_shares')
    .select('assets')
    .eq('id', id)
    .maybeSingle()

  const media = await resolveFormAssets(
    supabase,
    formData,
    value.postId,
    (existing?.assets as ShareAsset[] | null) ?? null
  )

  if ('error' in media) return { error: media.error, saved: false }

  // El `in('status', ...)` no es redundante con la UI: entre que se abrió el
  // diálogo y se guardó, el cron pudo haberlo entregado a Buffer, y ahí editar
  // acá no cambiaría nada de lo que ya salió.
  const { data, error } = await supabase
    .from('post_social_shares')
    .update({
      scheduled_at: value.at.toISOString(),
      message: value.message || null,
      assets: media.assets,
      link_in_first_comment: formData.get('link_in_first_comment') === 'on',
      error: null
    })
    .eq('id', id)
    .in('status', ['scheduled', 'failed'])
    .select('id')

  if (error) return { error: error.message, saved: false }
  if (data.length === 0) return { error: 'El envío ya se entregó a Buffer; no se puede editar', saved: false }

  revalidatePath('/admin/linkedin')

  return { error: null, saved: true }
}

/** Baja un envío de la agenda. No borra: deja el registro de que se decidió no compartirlo. */
export async function cancelShare(id: string): Promise<{ error: string | null }> {
  await requireAdmin()

  const supabase = await createSupabaseServerClient()

  const { error } = await supabase
    .from('post_social_shares')
    .update({ status: 'canceled' })
    .eq('id', id)
    .in('status', ['scheduled', 'failed'])

  if (error) return { error: error.message }

  revalidatePath('/admin/linkedin')

  return { error: null }
}

/**
 * Borra un envío del historial.
 *
 * Sólo toca la agenda local: el posteo ya está en LinkedIn y desde acá no se
 * puede bajar —la API de borrado pide otro scope y, por Buffer, ni siquiera es
 * nuestro el post—. Lo que se pierde es el registro, y con él la marca «ya
 * salió el …» que aparece junto al artículo en la columna de la derecha.
 *
 * Se limita a lo terminal: un envío programado se cancela, que deja rastro de
 * que se decidió no publicarlo.
 */
export async function deleteShare(id: string): Promise<{ error: string | null }> {
  await requireAdmin()

  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from('post_social_shares')
    .delete()
    .eq('id', id)
    .in('status', ['queued', 'canceled'])
    .select('id')

  if (error) return { error: error.message }
  if (data.length === 0) return { error: 'Sólo se pueden borrar envíos ya publicados o cancelados' }

  revalidatePath('/admin/linkedin')

  return { error: null }
}

/** Devuelve un envío fallido a la agenda para que el cron lo reintente. */
export async function retryShare(id: string): Promise<{ error: string | null }> {
  await requireAdmin()

  const supabase = await createSupabaseServerClient()

  const { error } = await supabase
    .from('post_social_shares')
    .update({ status: 'scheduled', error: null })
    .eq('id', id)
    .in('status', ['failed', 'sending'])

  if (error) return { error: error.message }

  revalidatePath('/admin/linkedin')

  return { error: null }
}

/**
 * Publica un envío en el momento, sin esperar al cron.
 *
 * Comparte toda la lógica con la corrida automática —`deliverShare` es el
 * mismo código— así que un posteo publicado a mano sale idéntico al que
 * hubiera salido solo: mismo texto, misma media, mismo primer comentario.
 *
 * Acepta también los fallidos: es el caso más común para este botón, mirar el
 * error, arreglar lo que sea y publicar sin esperar al día siguiente.
 */
export async function publishNow(id: string): Promise<{ error: string | null; warning: string | null }> {
  await requireAdmin()

  const supabase = await createSupabaseServerClient()
  const config = await getDeliveryConfig(supabase)

  const result = await deliverShare(supabase, id, config, {
    allowedFrom: ['scheduled', 'failed'],
    immediate: true
  })

  revalidatePath('/admin/linkedin')

  return result.ok
    ? { error: null, warning: result.warning }
    : { error: result.error, warning: null }
}
