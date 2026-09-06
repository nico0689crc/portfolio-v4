/**
 * Campos de prosa del caso de estudio.
 *
 * Viven acá y no en `case-study-actions.ts` porque un módulo `'use server'`
 * sólo puede exportar funciones async: una constante ahí rompe el build con un
 * error que no menciona la constante.
 */
export const PROSE_FIELDS = [
  'overview',
  'role',
  'duration',
  'team',
  'context',
  'problem',
  'process_desc',
  'results',
  'learnings',
  'note_html',
  'note_url',
  'note_link_text'
] as const
