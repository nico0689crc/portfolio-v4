'use server'

// Lib Imports
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { updateTags } from '@/lib/content/cache'
import { TAGS } from '@/lib/content/tags'
import { requireAdmin } from './auth'
import { PROSE_FIELDS } from './case-study-fields'

export type CaseStudyFormState = {
  error: string | null
  saved: boolean
}

const LOCALES = ['es', 'en'] as const


const orNull = (value: FormDataEntryValue | null) => {
  const text = String(value ?? '').trim()

  return text === '' ? null : text
}

export async function saveCaseStudy(
  projectKey: string,
  _prev: CaseStudyFormState,
  formData: FormData
): Promise<CaseStudyFormState> {
  await requireAdmin()

  const supabase = await createSupabaseServerClient()

  const { data: project } = await supabase.from('projects').select('id').eq('key', projectKey).maybeSingle()

  if (!project) return { error: 'No se encontró el proyecto.', saved: false }

  // La fila padre puede no existir todavia: un proyecto sin caso escrito no
  // tiene por que tenerla, y el editor la crea al guardar por primera vez.
  const { error: parentError } = await supabase
    .from('case_studies')
    .upsert({ project_id: project.id }, { onConflict: 'project_id' })

  if (parentError) return { error: `No se pudo guardar: ${parentError.message}`, saved: false }

  const translations = LOCALES.map(locale => ({
    project_id: project.id,
    locale,
    ...Object.fromEntries(PROSE_FIELDS.map(field => [field, orNull(formData.get(`${locale}.${field}`))]))
  }))

  const { error: translationError } = await supabase
    .from('case_study_translations')
    .upsert(translations as never, { onConflict: 'project_id,locale' })

  if (translationError) return { error: `No se pudo guardar: ${translationError.message}`, saved: false }

  const phaseIds: string[] = JSON.parse(String(formData.get('phaseIds') ?? '[]'))
  const metricIds: string[] = JSON.parse(String(formData.get('metricIds') ?? '[]'))
  const deletedPhases: string[] = JSON.parse(String(formData.get('deletedPhases') ?? '[]'))
  const deletedMetrics: string[] = JSON.parse(String(formData.get('deletedMetrics') ?? '[]'))

  if (phaseIds.length > 0) {
    const phases = phaseIds.map((id, index) => ({
      id,
      project_id: project.id,
      slug: String(formData.get(`${id}.slug`) ?? '').trim(),
      sort_order: index
    }))

    // El slug de la fase es lo que elige su icono en la pagina publica, asi que
    // vacio no es un detalle cosmetico: la fase se renderiza sin identidad.
    if (phases.some(phase => !phase.slug)) {
      return { error: 'Cada fase necesita un slug.', saved: false }
    }

    const { error } = await supabase.from('case_study_phases').upsert(phases, { onConflict: 'id' })

    if (error) return { error: `No se pudo guardar: ${error.message}`, saved: false }

    const phaseTranslations = phaseIds.flatMap(id =>
      LOCALES.map(locale => ({
        phase_id: id,
        locale,
        label: orNull(formData.get(`${id}.${locale}.label`)),
        title: orNull(formData.get(`${id}.${locale}.title`)),
        body: orNull(formData.get(`${id}.${locale}.body`))
      }))
    )

    const { error: ptError } = await supabase
      .from('case_study_phase_translations')
      .upsert(phaseTranslations as never, { onConflict: 'phase_id,locale' })

    if (ptError) return { error: `No se pudo guardar: ${ptError.message}`, saved: false }
  }

  if (metricIds.length > 0) {
    const metrics = metricIds.map((id, index) => ({ id, project_id: project.id, sort_order: index }))

    const { error } = await supabase.from('case_study_metrics').upsert(metrics, { onConflict: 'id' })

    if (error) return { error: `No se pudo guardar: ${error.message}`, saved: false }

    const metricTranslations = metricIds.flatMap(id =>
      LOCALES.map(locale => ({
        metric_id: id,
        locale,
        value: String(formData.get(`${id}.${locale}.value`) ?? '').trim(),
        label: String(formData.get(`${id}.${locale}.label`) ?? '').trim()
      }))
    )

    if (metricTranslations.some(row => !row.value || !row.label)) {
      return { error: 'Cada métrica necesita valor y etiqueta en los dos idiomas.', saved: false }
    }

    const { error: mtError } = await supabase
      .from('case_study_metric_translations')
      .upsert(metricTranslations, { onConflict: 'metric_id,locale' })

    if (mtError) return { error: `No se pudo guardar: ${mtError.message}`, saved: false }
  }

  if (deletedPhases.length > 0) await supabase.from('case_study_phases').delete().in('id', deletedPhases)
  if (deletedMetrics.length > 0) await supabase.from('case_study_metrics').delete().in('id', deletedMetrics)

  updateTags([TAGS.projects, TAGS.project(projectKey), TAGS.all])

  return { error: null, saved: true }
}
