'use server'

// Next Imports
import { revalidatePath } from 'next/cache'

// Lib Imports
import { updateTags } from '@/lib/content/cache'
import { TAGS } from '@/lib/content/tags'
import { GENERATED_DOCUMENT_ROUTES } from '@/lib/content/routes'
import { requireAdmin } from './auth'

export type RegenerateState = {
  error: string | null
  regeneratedAt: string | null
}

/**
 * Fuerza la regeneración de los documentos que se arman desde la base.
 *
 * Existe porque invalidar por tag no alcanza. Verificado en next@16.1.6:
 * `revalidateTag` no purga las entradas de `unstable_cache`, así que el CV en
 * PDF seguía sirviendo la versión anterior aunque todo respondiera 200. La
 * invalidación por ruta sí las fuerza a rehacerse.
 *
 * Los guardados del panel siguen llamando a `updateTags`, que es lo correcto
 * para las páginas. Este botón es para lo otro: los documentos, y cualquier
 * cambio hecho fuera de la app —una migración, una edición directa en Supabase—
 * que ninguna acción llegó a invalidar.
 */
export async function regenerateDocuments(): Promise<RegenerateState> {
  await requireAdmin()

  try {
    updateTags([TAGS.all])

    for (const route of GENERATED_DOCUMENT_ROUTES) revalidatePath(route)

    return { error: null, regeneratedAt: new Date().toISOString() }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'No se pudo regenerar.',
      regeneratedAt: null
    }
  }
}
