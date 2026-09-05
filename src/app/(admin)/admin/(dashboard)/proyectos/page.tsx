// Next Imports
import Link from 'next/link'

// Component Imports
import { Badge } from '@/components/admin/ui/badge'
import { Button } from '@/components/admin/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/admin/ui/table'

// Lib Imports
import { createSupabaseServerClient } from '@/lib/supabase/server'

export const metadata = { title: 'Proyectos' }

/**
 * Reads with the editor's own session, not the public client. That is what
 * makes drafts visible here: the public client filters `status = 'published'`,
 * so a backoffice built on it could never show the thing being drafted.
 */
const AdminProjectsPage = async () => {
  const supabase = await createSupabaseServerClient()

  const { data: projects, error } = await supabase
    .from('projects')
    .select('key, category, status, sort_order, project_translations(locale, title, slug)')
    .order('sort_order')

  if (error) {
    return <p className='text-destructive text-sm'>No se pudieron cargar los proyectos: {error.message}</p>
  }

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex items-center justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-semibold tracking-tight'>Proyectos</h1>
          <p className='text-muted-foreground text-sm'>
            {projects.length} {projects.length === 1 ? 'proyecto' : 'proyectos'} en total
          </p>
        </div>
      </div>

      <div className='border-border rounded-lg border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Slugs</TableHead>
              <TableHead className='w-0' />
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map(project => {
              // The ES title labels the row because the panel is in Spanish;
              // `key` is the fallback so a half-translated project is still
              // identifiable instead of rendering an empty cell.
              const es = project.project_translations.find(t => t.locale === 'es')
              const en = project.project_translations.find(t => t.locale === 'en')

              return (
                <TableRow key={project.key}>
                  <TableCell className='font-medium'>
                    {es?.title ?? project.key}
                    <span className='text-muted-foreground block text-xs font-normal'>{project.key}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant='outline'>{project.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={project.status === 'published' ? 'default' : 'secondary'}>
                      {project.status === 'published' ? 'Publicado' : 'Borrador'}
                    </Badge>
                  </TableCell>
                  <TableCell className='text-muted-foreground font-mono text-xs'>
                    <span className='block'>es / {es?.slug ?? '—'}</span>
                    <span className='block'>en / {en?.slug ?? '—'}</span>
                  </TableCell>
                  <TableCell>
                    <Button variant='outline' size='sm' render={<Link href={`/admin/proyectos/${project.key}`} />}>
                      Editar
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default AdminProjectsPage
