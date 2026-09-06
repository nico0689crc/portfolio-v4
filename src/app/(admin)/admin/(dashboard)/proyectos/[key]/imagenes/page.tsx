// Next Imports
import { notFound } from 'next/navigation'

// Component Imports
import ImagesManager, { type ProjectImageValues } from '@/components/admin/views/projects/ImagesManager'
import ProjectTabs from '@/components/admin/views/projects/ProjectTabs'

// Lib Imports
import { createSupabaseServerClient } from '@/lib/supabase/server'

const LOCALES = ['es', 'en'] as const

export const generateMetadata = async ({ params }: { params: Promise<{ key: string }> }) => {
  const { key } = await params

  return { title: `Imágenes · ${key}` }
}

const AdminProjectImagesPage = async ({ params }: { params: Promise<{ key: string }> }) => {
  const { key } = await params
  const supabase = await createSupabaseServerClient()

  const { data: project } = await supabase
    .from('projects')
    .select(
      `key,
       project_images(id, storage_path, width, height, sort_order,
                      project_image_translations(locale, alt))`
    )
    .eq('key', key)
    .maybeSingle()

  if (!project) notFound()

  const images: ProjectImageValues[] = [...project.project_images]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(image => ({
      id: image.id,
      storagePath: image.storage_path,
      width: image.width,
      height: image.height,
      alts: Object.fromEntries(
        LOCALES.map(locale => [
          locale,
          image.project_image_translations.find(t => t.locale === locale)?.alt ?? ''
        ])
      )
    }))

  return (
    <div className='flex flex-col gap-6'>
      <div>
        <h1 className='text-2xl font-semibold tracking-tight'>Imágenes</h1>
        <p className='text-muted-foreground font-mono text-xs'>{project.key}</p>
      </div>

      <ProjectTabs projectKey={project.key} />
      <ImagesManager projectKey={project.key} initialImages={images} />
    </div>
  )
}

export default AdminProjectImagesPage
