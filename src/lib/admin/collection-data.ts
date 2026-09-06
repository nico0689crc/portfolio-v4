// Lib Imports
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { CollectionDef } from './collections'

const LOCALES = ['es', 'en'] as const

export type CollectionRow = {
  id: string
  base: Record<string, unknown>
  translations: Record<string, Record<string, string>>
}

/**
 * Deliberadamente fuera de `collection-actions.ts`.
 *
 * En un modulo `'use server'` cada export se vuelve una server action que el
 * browser puede invocar. Esta funcion recibe la definicion de la coleccion como
 * argumento, asi que expuesta asi seria un lector generico de tablas al que
 * cualquiera podria pasarle la que quisiera. Como server component no cruza esa
 * frontera: corre bajo el layout que ya valido `requireAdmin()`.
 */
export async function loadCollection(def: CollectionDef): Promise<CollectionRow[]> {
  const supabase = await createSupabaseServerClient()

  const baseColumns = ['id', 'sort_order', ...def.base.map(f => f.name)].join(', ')
  const translatedColumns = ['locale', ...def.translated.map(f => f.name)].join(', ')

  const { data, error } = await supabase
    .from(def.table)
    .select(`${baseColumns}, ${def.translationTable}(${translatedColumns})`)
    .order('sort_order')

  if (error) throw new Error(`loadCollection(${def.table}): ${error.message}`)

  return (data as unknown as Record<string, unknown>[]).map(row => {
    const translationRows = (row[def.translationTable] ?? []) as Record<string, string>[]

    return {
      id: String(row.id),
      base: Object.fromEntries(def.base.map(f => [f.name, row[f.name]])),
      translations: Object.fromEntries(
        LOCALES.map(locale => {
          const match = translationRows.find(t => t.locale === locale)

          return [
            locale,
            Object.fromEntries(def.translated.map(f => [f.name, match?.[f.name] ?? '']))
          ]
        })
      )
    }
  })
}
