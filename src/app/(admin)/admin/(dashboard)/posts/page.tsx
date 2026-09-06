// Next Imports
import Link from 'next/link'

// Third-party Imports
import { Plus } from 'lucide-react'

// Component Imports
import { Button } from '@/components/admin/ui/button'
import PostsList from '@/components/admin/views/posts/PostsList'

// Lib Imports
import { listPosts } from '@/lib/admin/posts-list'

export const metadata = { title: 'Posts' }

/**
 * El listado de artículos.
 *
 * Acá queda sólo el encabezado y la primera página: el filtro, el orden y la
 * paginación los maneja `PostsList` contra un action, así que ninguno de los
 * tres recarga la página. De ahí que ya no lea `searchParams`.
 */
const AdminPostsPage = async () => {
  const firstPage = await listPosts()

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex flex-wrap items-start justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-semibold tracking-tight'>Posts</h1>
          <p className='text-muted-foreground text-sm'>
            {firstPage.total === 0
              ? 'El blog todavía no tiene entradas.'
              : `${firstPage.counts.todos} activos, ${firstPage.counts.archivados} archivados.`}
          </p>
        </div>
        <Button render={<Link href='/admin/posts/nuevo' />}>
          <Plus className='size-4' /> Nuevo artículo
        </Button>
      </div>

      <PostsList initial={firstPage} />
    </div>
  )
}

export default AdminPostsPage
