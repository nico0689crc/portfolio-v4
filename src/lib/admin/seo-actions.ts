'use server'

// Third-party Imports
import { z } from 'zod'

// Lib Imports
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { updateTags } from '@/lib/content/cache'
import { TAGS } from '@/lib/content/tags'
import { requireAdmin } from './auth'

export type SeoFormState = {
  error: string | null
  saved: boolean
}

const LOCALES = ['es', 'en'] as const

const translation = z.object({
  title: z.string().trim().min(1, 'El título no puede estar vacío'),
  description: z.string().trim().min(1, 'La descripción no puede estar vacía'),
  og_image: z.string().trim().nullable(),
  noindex: z.boolean()
})

/**
 * Las rutas no se crean ni se borran desde acá: son las que existen en el
 * enrutador. Editarlas es lo único que tiene sentido, así que la acción recibe
 * la lista de las que ya están y no acepta otras.
 */
export async function updatePageSeo(
  routeKeys: string[],
  _prev: SeoFormState,
  formData: FormData
): Promise<SeoFormState> {
  await requireAdmin()

  const rows: Record<string, unknown>[] = []

  for (const routeKey of routeKeys) {
    for (const locale of LOCALES) {
      const parsed = translation.safeParse({
        title: formData.get(`${routeKey}.${locale}.title`),
        description: formData.get(`${routeKey}.${locale}.description`),
        og_image: String(formData.get(`${routeKey}.${locale}.og_image`) ?? '').trim() || null,
        noindex: formData.get(`${routeKey}.${locale}.noindex`) === 'on'
      })

      if (!parsed.success) {
        return { error: `${routeKey} (${locale}): ${parsed.error.issues[0].message}`, saved: false }
      }

      rows.push({ route_key: routeKey, locale, ...parsed.data })
    }
  }

  const supabase = await createSupabaseServerClient()

  const { error } = await supabase
    .from('page_seo_translations')
    .upsert(rows as never, { onConflict: 'route_key,locale' })

  if (error) return { error: `No se pudo guardar: ${error.message}`, saved: false }

  // Cada ruta tiene su propio tag además del general, así que editar el SEO de
  // /contact no rehace el de todas las demás.
  updateTags([TAGS.seo, ...routeKeys.map(key => TAGS.seoRoute(key)), TAGS.all])

  return { error: null, saved: true }
}
