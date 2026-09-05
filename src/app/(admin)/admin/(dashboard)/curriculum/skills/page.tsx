// Component Imports
import SkillsEditor, { type CategoryValues } from '@/components/admin/views/skills/SkillsEditor'

// Lib Imports
import { createSupabaseServerClient } from '@/lib/supabase/server'

export const metadata = { title: 'Skills' }

const AdminSkillsPage = async () => {
  const supabase = await createSupabaseServerClient()

  const { data } = await supabase
    .from('skill_categories')
    .select(
      `id, slug, sort_order,
       skill_category_translations(locale, label),
       skills(id, name_default, is_translatable, sort_order, skill_translations(locale, name))`
    )
    .order('sort_order')

  const categories: CategoryValues[] = (data ?? []).map(category => ({
    id: category.id,
    slug: category.slug,
    labels: Object.fromEntries(category.skill_category_translations.map(t => [t.locale, t.label])),
    skills: [...category.skills]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(skill => ({
        id: skill.id,
        nameDefault: skill.name_default,
        isTranslatable: skill.is_translatable,
        names: Object.fromEntries(skill.skill_translations.map(t => [t.locale, t.name]))
      }))
  }))

  return (
    <div className='flex flex-col gap-6'>
      <div>
        <h1 className='text-2xl font-semibold tracking-tight'>Skills</h1>
        <p className='text-muted-foreground text-sm'>
          Categorías y sus skills. Alimentan el CV y el knowsAbout del structured data.
        </p>
      </div>

      <SkillsEditor initialCategories={categories} />
    </div>
  )
}

export default AdminSkillsPage
