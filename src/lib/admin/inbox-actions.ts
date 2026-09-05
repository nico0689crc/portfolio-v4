'use server'

// Third-party Imports
import { z } from 'zod'

// Lib Imports
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from './auth'

const STATUSES = ['new', 'read', 'replied', 'spam'] as const

export type MessageStatus = (typeof STATUSES)[number]

/**
 * La bandeja no pasa por los tags de contenido: `contact_messages` no lo lee
 * ninguna página pública, así que invalidar el árbol entero por marcar un
 * mensaje como leído sería tirar el cache del sitio por nada.
 */
export async function setMessageStatus(id: string, status: string): Promise<{ error: string | null }> {
  await requireAdmin()

  const parsed = z.object({ id: z.string().uuid(), status: z.enum(STATUSES) }).safeParse({ id, status })

  if (!parsed.success) return { error: 'Estado inválido.' }

  const supabase = await createSupabaseServerClient()

  const { error } = await supabase
    .from('contact_messages')
    .update({ status: parsed.data.status })
    .eq('id', parsed.data.id)

  if (error) return { error: error.message }

  revalidatePath('/admin/mensajes')

  return { error: null }
}
