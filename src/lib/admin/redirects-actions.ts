'use server'

// Third-party Imports
import { z } from 'zod'

// Lib Imports
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from './auth'

export type RedirectsFormState = {
  error: string | null
  saved: boolean
}

const path = z
  .string()
  .trim()
  .startsWith('/', 'Tiene que empezar con «/»')
  .refine(value => !value.includes(' '), 'No puede tener espacios')

const row = z.object({ from_path: path, to_path: path, permanent: z.boolean() })

export async function saveRedirects(
  _prev: RedirectsFormState,
  formData: FormData
): Promise<RedirectsFormState> {
  await requireAdmin()

  const keys: string[] = JSON.parse(String(formData.get('keys') ?? '[]'))
  const deleted: string[] = JSON.parse(String(formData.get('deleted') ?? '[]'))

  const rows = keys.map(key => ({
    from_path: String(formData.get(`${key}.from_path`) ?? '').trim(),
    to_path: String(formData.get(`${key}.to_path`) ?? '').trim(),
    permanent: formData.get(`${key}.permanent`) === 'on'
  }))

  for (const candidate of rows) {
    const parsed = row.safeParse(candidate)

    if (!parsed.success) return { error: parsed.error.issues[0].message, saved: false }

    // Una redirección a sí misma es un bucle infinito servido con 308, y el
    // navegador corta con un error que no dice de dónde salió.
    if (parsed.data.from_path === parsed.data.to_path) {
      return { error: `«${parsed.data.from_path}» apunta a sí misma.`, saved: false }
    }
  }

  const supabase = await createSupabaseServerClient()

  // `from_path` es la clave primaria, así que editar el origen de una fila es
  // en realidad crear otra. Se borran primero las que salieron y las que
  // cambiaron de origen, y después se insertan todas.
  const gone = [...deleted, ...keys.filter(key => key !== rows[keys.indexOf(key)]?.from_path)]

  if (gone.length > 0) {
    const { error } = await supabase.from('redirects').delete().in('from_path', gone)

    if (error) return { error: `No se pudo eliminar: ${error.message}`, saved: false }
  }

  if (rows.length > 0) {
    const { error } = await supabase.from('redirects').upsert(rows, { onConflict: 'from_path' })

    if (error) return { error: `No se pudo guardar: ${error.message}`, saved: false }
  }

  // Las redirecciones las sirve next.config a partir de esta tabla, así que no
  // hay tag de contenido que invalidar: se refresca la propia pantalla.
  revalidatePath('/admin/redirecciones')

  return { error: null, saved: true }
}
