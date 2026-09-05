'use server'

// Third-party Imports
import { z } from 'zod'

// Lib Imports
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { updateTags } from '@/lib/content/cache'
import { TAGS } from '@/lib/content/tags'
import { requireAdmin } from './auth'
import type { Json } from '@/types/database'

export type SettingsFormState = {
  error: string | null
  saved: boolean
}

/**
 * `settings.value` es jsonb, asi que cada clave tiene su propia forma.
 *
 * Un editor generico de JSON seria mas corto y peor: le pediria al editor que
 * escriba comillas y corchetes a mano, y un error de sintaxis romperia la home
 * sin decir donde. Cada clave se valida contra lo que la capa de contenido
 * espera leer.
 */
const SCHEMAS = {
  contact_email: z.string().trim().email('Tiene que ser un email válido'),
  years_of_experience: z.coerce.number().int().min(0).max(80),
  social_links: z.array(z.string().url('Cada enlace tiene que ser una URL')),
  cv_files: z.object({
    es: z.string().trim().startsWith('/', 'Tiene que ser una ruta del sitio'),
    en: z.string().trim().startsWith('/', 'Tiene que ser una ruta del sitio')
  })
} as const

export async function updateSettings(
  _prev: SettingsFormState,
  formData: FormData
): Promise<SettingsFormState> {
  await requireAdmin()

  const raw = {
    contact_email: String(formData.get('contact_email') ?? '').trim(),
    years_of_experience: String(formData.get('years_of_experience') ?? ''),
    social_links: String(formData.get('social_links') ?? '')
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean),
    cv_files: {
      es: String(formData.get('cv_files.es') ?? '').trim(),
      en: String(formData.get('cv_files.en') ?? '').trim()
    }
  }

  const values: Record<string, Json> = {}

  for (const [key, schema] of Object.entries(SCHEMAS)) {
    const parsed = schema.safeParse(raw[key as keyof typeof raw])

    if (!parsed.success) {
      return { error: `${key}: ${parsed.error.issues[0].message}`, saved: false }
    }

    values[key] = parsed.data as Json
  }

  const supabase = await createSupabaseServerClient()

  const { error } = await supabase
    .from('settings')
    .upsert(
      Object.entries(values).map(([key, value]) => ({ key, value })),
      { onConflict: 'key' }
    )

  if (error) return { error: `No se pudo guardar: ${error.message}`, saved: false }

  // `settings` alimenta el footer, el CV y el structured data de todas las
  // páginas, así que se invalida todo el árbol y no sólo su propio tag.
  updateTags([TAGS.settings, TAGS.all])

  return { error: null, saved: true }
}
