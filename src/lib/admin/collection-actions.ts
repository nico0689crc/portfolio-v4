'use server'

// Lib Imports
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { updateTags } from '@/lib/content/cache'
import { COLLECTION_BY_SLUG, type FieldDef } from './collections'
import { requireAdmin } from './auth'

export type CollectionFormState = {
  error: string | null
  saved: boolean
}

const LOCALES = ['es', 'en'] as const

/**
 * Convierte lo que manda un input HTML al tipo que espera la columna.
 *
 * Todo llega como string. La distincion que importa es `''`: para un texto
 * opcional significa null, y mandarlo como cadena vacia llenaria la base de
 * valores que se ven iguales pero no son null en ninguna query.
 */
function coerce(field: FieldDef, raw: FormDataEntryValue | null): unknown {
  if (field.type === 'boolean') return raw === 'on'

  const value = String(raw ?? '').trim()

  if (field.type === 'list') {
    return value
      .split(',')
      .map(item => item.trim())
      .filter(Boolean)
  }

  if (value === '') return null
  if (field.type === 'number') return Number(value)

  return value
}

export async function saveCollection(
  slug: string,
  _prev: CollectionFormState,
  formData: FormData
): Promise<CollectionFormState> {
  await requireAdmin()

  const def = COLLECTION_BY_SLUG[slug]

  if (!def) return { error: 'Colección desconocida.', saved: false }

  const ids: string[] = JSON.parse(String(formData.get('ids') ?? '[]'))
  const deleted: string[] = JSON.parse(String(formData.get('deleted') ?? '[]'))
  const supabase = await createSupabaseServerClient()

  // El orden de la lista ES el sort_order. Guardarlo asi evita el modo de falla
  // clasico de un campo numerico editable a mano: dos filas con el mismo numero
  // y un orden que depende de como la base decida desempatar.
  const baseRows = ids.map((id, index) => {
    const row: Record<string, unknown> = { id, sort_order: index }

    for (const field of def.base) row[field.name] = coerce(field, formData.get(`${id}.${field.name}`))

    return row
  })

  const missing = baseRows.find(row =>
    def.base.some(field => field.required && (row[field.name] === null || row[field.name] === ''))
  )

  if (missing) {
    const field = def.base.find(f => f.required && !missing[f.name])

    return { error: `Falta completar "${field?.label}" en una de las filas.`, saved: false }
  }

  if (baseRows.length > 0) {
    // El cast es inevitable y acotado: las filas se arman a partir de la
    // definición, asi que su forma la garantiza `def`, pero TypeScript no puede
    // estrechar el tipo de la tabla a partir de un valor que no conoce en
    // tiempo de compilacion. `table` ya esta limitado a tablas que existen.
    const { error } = await supabase.from(def.table).upsert(baseRows as never, { onConflict: 'id' })

    if (error) return { error: `No se pudo guardar: ${error.message}`, saved: false }
  }

  const translationRows = ids.flatMap(id =>
    LOCALES.map(locale => {
      const row: Record<string, unknown> = { [def.foreignKey]: id, locale }

      for (const field of def.translated) {
        row[field.name] = coerce(field, formData.get(`${id}.${locale}.${field.name}`))
      }

      return row
    })
  )

  if (translationRows.length > 0) {
    const { error } = await supabase
      .from(def.translationTable)
      .upsert(translationRows as never, { onConflict: `${def.foreignKey},locale` })

    if (error) return { error: `No se pudo guardar: ${error.message}`, saved: false }
  }

  // Se borra al final y no al principio: si el guardado falla a mitad, la fila
  // que el editor quiso eliminar sigue estando y puede reintentar sobre el
  // mismo estado en vez de sobre uno a medias.
  if (deleted.length > 0) {
    const { error } = await supabase.from(def.table).delete().in('id', deleted)

    if (error) return { error: `No se pudo eliminar: ${error.message}`, saved: false }
  }

  updateTags(def.tags)

  return { error: null, saved: true }
}
