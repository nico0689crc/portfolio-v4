'use server'

// Lib Imports
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { updateTags } from '@/lib/content/cache'
import { TAGS } from '@/lib/content/tags'
import { requireAdmin } from './auth'

export type UiMessagesFormState = {
  error: string | null
  saved: boolean
}

const LOCALES = ['es', 'en'] as const

/**
 * Guarda los textos de UI.
 *
 * Se mandan y se escriben todos, no solo los que cambiaron. Con ~260 filas el
 * costo es despreciable, y calcular el diff en el cliente significaria confiar
 * en que el navegador sepa cual era el valor original — que es exactamente lo
 * que deja de ser cierto si dos personas editan a la vez.
 */
export async function saveUiMessages(
  keys: string[],
  _prev: UiMessagesFormState,
  formData: FormData
): Promise<UiMessagesFormState> {
  await requireAdmin()

  const rows = keys.flatMap(key =>
    LOCALES.map(locale => ({
      key,
      locale,
      value: String(formData.get(`${key}.${locale}`) ?? '')
    }))
  )

  const empty = rows.find(row => row.value.trim() === '')

  if (empty) {
    return { error: `Falta el texto de «${empty.key}» en ${empty.locale.toUpperCase()}.`, saved: false }
  }

  const supabase = await createSupabaseServerClient()

  const { error } = await supabase.from('ui_messages').upsert(rows, { onConflict: 'key,locale' })

  if (error) return { error: `No se pudo guardar: ${error.message}`, saved: false }

  // El arbol de mensajes se arma por idioma y es lo mas caro de reconstruir,
  // por eso tiene un tag propio por locale.
  updateTags([...LOCALES.map(locale => TAGS.messages(locale)), TAGS.all])

  return { error: null, saved: true }
}
