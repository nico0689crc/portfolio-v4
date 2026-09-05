// Next Imports
import { notFound } from 'next/navigation'

// Component Imports
import ProjectForm, { type ProjectFormValues } from '@/components/admin/views/projects/ProjectForm'
import ProjectTabs from '@/components/admin/views/projects/ProjectTabs'

// Lib Imports
import { createSupabaseServerClient } from '@/lib/supabase/server'

// Los idiomas del editor son fijos: son dos columnas del formulario, no datos.
const LOCALES = ['es', 'en'] as const

const EMPTY = {
  slug: '',
  title: '',
  description: '',
  seoTitle: '',
  seoDescription: '',
  noindex: false
}

export const generateMetadata = async ({ params }: { params: Promise<{ key: string }> }) => {
  const { key } = await params

  return { title: `Proyecto · ${key}` }
}

const AdminProjectEditPage = async ({ params }: { params: Promise<{ key: string }> }) => {
  const { key } = await params
  const supabase = await createSupabaseServerClient()

  const { data: project } = await supabase
    .from('projects')
    .select(
      `key, category, status, sort_order, techs, links,
       project_translations(locale, slug, title, description, seo_title, seo_description, noindex)`
    )
    .eq('key', key)
    .maybeSingle()

  if (!project) notFound()

  // Cada idioma tiene su columna aunque todavía no exista su fila: sin esto, un
  // proyecto traducido a medias no tendría dónde escribirse el idioma que falta.
  const translations = Object.fromEntries(
    LOCALES.map(locale => {
      const row = project.project_translations.find(t => t.locale === locale)

      return [
        locale,
        row
          ? {
              slug: row.slug,
              title: row.title,
              description: row.description,
              seoTitle: row.seo_title ?? '',
              seoDescription: row.seo_description ?? '',
              noindex: row.noindex
            }
          : EMPTY
      ]
    })
  )

  const values: ProjectFormValues = {
    key: project.key,
    category: project.category,
    status: project.status,
    sortOrder: project.sort_order,
    techs: project.techs,
    links: (project.links ?? {}) as Record<string, string>,
    translations
  }

  return (
    <div className='flex flex-col gap-6'>
      <div>
        <h1 className='text-2xl font-semibold tracking-tight'>{translations.es.title || project.key}</h1>
        <p className='text-muted-foreground font-mono text-xs'>{project.key}</p>
      </div>

      <ProjectTabs projectKey={project.key} />
      <ProjectForm project={values} />
    </div>
  )
}

export default AdminProjectEditPage
