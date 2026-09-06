'use server'

// Lib Imports
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { updateTags } from '@/lib/content/cache'
import { TAGS } from '@/lib/content/tags'
import { requireAdmin } from './auth'

export type SkillsFormState = {
  error: string | null
  saved: boolean
}

const LOCALES = ['es', 'en'] as const

/**
 * Guarda categorias y skills juntas.
 *
 * Van en una sola accion porque una skill sin su categoria no existe: separar
 * los guardados abriria la ventana en la que una categoria recien creada ya
 * tiene skills apuntandole y todavia no esta en la base.
 */
export async function saveSkills(
  _prev: SkillsFormState,
  formData: FormData
): Promise<SkillsFormState> {
  await requireAdmin()

  const categoryIds: string[] = JSON.parse(String(formData.get('categoryIds') ?? '[]'))
  const skillIds: Record<string, string[]> = JSON.parse(String(formData.get('skillIds') ?? '{}'))
  const deletedCategories: string[] = JSON.parse(String(formData.get('deletedCategories') ?? '[]'))
  const deletedSkills: string[] = JSON.parse(String(formData.get('deletedSkills') ?? '[]'))

  const supabase = await createSupabaseServerClient()

  const categories = categoryIds.map((id, index) => ({
    id,
    slug: String(formData.get(`${id}.slug`) ?? '').trim(),
    sort_order: index
  }))

  const missingSlug = categories.find(category => !category.slug)

  if (missingSlug) return { error: 'Cada categoría necesita un slug.', saved: false }

  if (categories.length > 0) {
    const { error } = await supabase.from('skill_categories').upsert(categories, { onConflict: 'id' })

    if (error) return { error: `No se pudo guardar: ${error.message}`, saved: false }
  }

  const categoryTranslations = categoryIds.flatMap(id =>
    LOCALES.map(locale => ({
      category_id: id,
      locale,
      label: String(formData.get(`${id}.${locale}.label`) ?? '').trim()
    }))
  )

  if (categoryTranslations.some(row => !row.label)) {
    return { error: 'Cada categoría necesita su etiqueta en los dos idiomas.', saved: false }
  }

  if (categoryTranslations.length > 0) {
    const { error } = await supabase
      .from('skill_category_translations')
      .upsert(categoryTranslations, { onConflict: 'category_id,locale' })

    if (error) return { error: `No se pudo guardar: ${error.message}`, saved: false }
  }

  // Las skills se ordenan dentro de su categoria, asi que el indice se reinicia
  // en cada una y no es global.
  const skills = categoryIds.flatMap(categoryId =>
    (skillIds[categoryId] ?? []).map((id, index) => ({
      id,
      category_id: categoryId,
      name_default: String(formData.get(`${id}.name_default`) ?? '').trim(),
      is_translatable: formData.get(`${id}.is_translatable`) === 'on',
      sort_order: index
    }))
  )

  if (skills.some(skill => !skill.name_default)) {
    return { error: 'Cada skill necesita un nombre por defecto.', saved: false }
  }

  if (skills.length > 0) {
    const { error } = await supabase.from('skills').upsert(skills, { onConflict: 'id' })

    if (error) return { error: `No se pudo guardar: ${error.message}`, saved: false }
  }

  // Solo se escriben las traducciones de las skills marcadas como traducibles.
  // Para el resto la fila no se usa nunca, y guardarla igual dejaria en la base
  // texto que nadie lee y que el proximo editor creeria que sale en algun lado.
  const skillTranslations = skills
    .filter(skill => skill.is_translatable)
    .flatMap(skill =>
      LOCALES.map(locale => ({
        skill_id: skill.id,
        locale,
        name: String(formData.get(`${skill.id}.${locale}.name`) ?? '').trim() || skill.name_default
      }))
    )

  if (skillTranslations.length > 0) {
    const { error } = await supabase
      .from('skill_translations')
      .upsert(skillTranslations, { onConflict: 'skill_id,locale' })

    if (error) return { error: `No se pudo guardar: ${error.message}`, saved: false }
  }

  if (deletedSkills.length > 0) {
    const { error } = await supabase.from('skills').delete().in('id', deletedSkills)

    if (error) return { error: `No se pudo eliminar: ${error.message}`, saved: false }
  }

  if (deletedCategories.length > 0) {
    const { error } = await supabase.from('skill_categories').delete().in('id', deletedCategories)

    if (error) return { error: `No se pudo eliminar: ${error.message}`, saved: false }
  }

  updateTags([TAGS.skills, TAGS.all])

  return { error: null, saved: true }
}
