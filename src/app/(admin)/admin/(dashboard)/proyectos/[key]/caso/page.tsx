// Next Imports
import { notFound } from 'next/navigation'

// Component Imports
import CaseStudyForm, { type CaseStudyValues } from '@/components/admin/views/projects/CaseStudyForm'
import ProjectTabs from '@/components/admin/views/projects/ProjectTabs'

// Lib Imports
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { PROSE_FIELDS } from '@/lib/admin/case-study-fields'

const LOCALES = ['es', 'en'] as const

export const generateMetadata = async ({ params }: { params: Promise<{ key: string }> }) => {
  const { key } = await params

  return { title: `Caso · ${key}` }
}

const AdminCaseStudyPage = async ({ params }: { params: Promise<{ key: string }> }) => {
  const { key } = await params
  const supabase = await createSupabaseServerClient()

  const { data: project } = await supabase
    .from('projects')
    .select(
      `id, key,
       case_studies(
         case_study_translations(locale, overview, role, duration, team, context, problem,
                                 process_desc, results, learnings, note_html, note_url, note_link_text),
         case_study_phases(id, slug, sort_order, case_study_phase_translations(locale, label, title, body)),
         case_study_metrics(id, sort_order, case_study_metric_translations(locale, value, label))
       )`
    )
    .eq('key', key)
    .maybeSingle()

  if (!project) notFound()

  const study = project.case_studies
  const proseRows = (study?.case_study_translations ?? []) as Record<string, string>[]

  const values: CaseStudyValues = {
    projectKey: project.key,
    prose: Object.fromEntries(
      LOCALES.map(locale => {
        const row = proseRows.find(r => r.locale === locale)

        return [locale, Object.fromEntries(PROSE_FIELDS.map(f => [f, row?.[f] ?? '']))]
      })
    ),
    phases: [...(study?.case_study_phases ?? [])]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(phase => ({
        id: phase.id,
        slug: phase.slug,
        translations: Object.fromEntries(
          LOCALES.map(locale => {
            const t = phase.case_study_phase_translations.find(r => r.locale === locale)

            return [locale, { label: t?.label ?? '', title: t?.title ?? '', body: t?.body ?? '' }]
          })
        )
      })),
    metrics: [...(study?.case_study_metrics ?? [])]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(metric => ({
        id: metric.id,
        translations: Object.fromEntries(
          LOCALES.map(locale => {
            const t = metric.case_study_metric_translations.find(r => r.locale === locale)

            return [locale, { value: t?.value ?? '', label: t?.label ?? '' }]
          })
        )
      }))
  }

  return (
    <div className='flex flex-col gap-6'>
      <div>
        <h1 className='text-2xl font-semibold tracking-tight'>Caso de estudio</h1>
        <p className='text-muted-foreground font-mono text-xs'>{project.key}</p>
      </div>

      <ProjectTabs projectKey={project.key} />
      <CaseStudyForm values={values} />
    </div>
  )
}

export default AdminCaseStudyPage
