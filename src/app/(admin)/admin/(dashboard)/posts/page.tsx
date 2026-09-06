// Next Imports
import Link from 'next/link'
import Image from 'next/image'

// Third-party Imports
import { Plus } from 'lucide-react'

// Component Imports
import { Badge } from '@/components/admin/ui/badge'
import { Button } from '@/components/admin/ui/button'
import PostRowActions from '@/components/admin/views/posts/PostRowActions'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/admin/ui/table'

// Lib Imports
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { BUCKETS, storageUrl } from '@/lib/content/storage'

export const metadata = { title: 'Posts' }

const FILTERS = [
  { key: 'todos', label: 'Todos' },
  { key: 'publicados', label: 'Publicados' },
  { key: 'borradores', label: 'Borradores' },
  { key: 'archivados', label: 'Archivados' }
] as const

type Filter = (typeof FILTERS)[number]['key']

const LOCALES = ['es', 'en'] as const

const AdminPostsPage = async ({
  searchParams
}: {
  searchParams: Promise<{ estado?: string }>
}) => {
  const { estado } = await searchParams
  const filter: Filter = FILTERS.some(f => f.key === estado) ? (estado as Filter) : 'todos'

  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from('posts')
    .select(
      `key, created_at, archived_at, cover_path,
       post_translations(locale, title, slug, status, published_at)`
    )
    .order('created_at', { ascending: false })

  if (error) {
    return <p className='text-destructive text-sm'>No se pudieron cargar los posts: {error.message}</p>
  }

  // El filtro se aplica acá y no en la consulta porque «publicado» depende de
  // las traducciones embebidas: filtrarlo en SQL descartaría el post entero
  // cuando sólo un idioma cumple, que es justo el caso que hay que mostrar.
  const posts = data.filter(post => {
    const statuses = post.post_translations.map(t => t.status)

    if (filter === 'archivados') return post.archived_at !== null
    if (post.archived_at !== null) return false
    if (filter === 'publicados') return statuses.includes('published')
    if (filter === 'borradores') return !statuses.includes('published')

    return true
  })

  const counts = {
    todos: data.filter(p => !p.archived_at).length,
    publicados: data.filter(
      p => !p.archived_at && p.post_translations.some(t => t.status === 'published')
    ).length,
    borradores: data.filter(
      p => !p.archived_at && !p.post_translations.some(t => t.status === 'published')
    ).length,
    archivados: data.filter(p => p.archived_at).length
  }

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex flex-wrap items-start justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-semibold tracking-tight'>Posts</h1>
          <p className='text-muted-foreground text-sm'>
            {data.length === 0
              ? 'El blog todavía no tiene entradas.'
              : `${counts.todos} activos, ${counts.archivados} archivados.`}
          </p>
        </div>
        <Button render={<Link href='/admin/posts/nuevo' />}>
          <Plus className='size-4' /> Nuevo artículo
        </Button>
      </div>

      <div className='flex flex-wrap gap-1'>
        {FILTERS.map(item => (
          <Button
            key={item.key}
            size='sm'
            variant={filter === item.key ? 'default' : 'outline'}
            render={<Link href={item.key === 'todos' ? '/admin/posts' : `/admin/posts?estado=${item.key}`} />}
          >
            {item.label} ({counts[item.key]})
          </Button>
        ))}
      </div>

      {posts.length === 0 ? (
        <p className='text-muted-foreground rounded-lg border border-dashed p-10 text-center text-sm'>
          {data.length === 0
            ? 'Todavía no escribiste ninguno. Empezá por el título.'
            : 'No hay artículos en este estado.'}
        </p>
      ) : (
        <div className='border-border rounded-lg border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-0' />
                <TableHead>Título</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Slugs</TableHead>
                <TableHead className='w-0 text-right'>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map(post => {
                const es = post.post_translations.find(t => t.locale === 'es')
                const title = es?.title ?? post.key

                return (
                  <TableRow key={post.key} className={post.archived_at ? 'opacity-60' : undefined}>
                    <TableCell>
                      <div className='bg-muted relative size-12 overflow-hidden rounded-md'>
                        {post.cover_path && (
                          <Image
                            src={storageUrl(post.cover_path, BUCKETS.postMedia)}
                            alt=''
                            fill
                            sizes='48px'
                            className='object-cover'
                          />
                        )}
                      </div>
                    </TableCell>

                    <TableCell className='font-medium'>
                      {title}
                      <span className='text-muted-foreground block text-xs font-normal'>{post.key}</span>
                    </TableCell>

                    <TableCell>
                      <div className='flex flex-wrap gap-1'>
                        {post.archived_at && <Badge variant='outline'>Archivado</Badge>}
                        {/* Un badge por idioma: la traducción puede seguir en
                            borrador mientras el original ya salió. */}
                        {LOCALES.map(locale => {
                          const t = post.post_translations.find(row => row.locale === locale)

                          if (!t) return null

                          return (
                            <Badge
                              key={locale}
                              variant={t.status === 'published' ? 'default' : 'secondary'}
                            >
                              {locale.toUpperCase()} {t.status === 'published' ? 'publicado' : 'borrador'}
                            </Badge>
                          )
                        })}
                      </div>
                    </TableCell>

                    <TableCell className='text-muted-foreground font-mono text-xs'>
                      {LOCALES.map(locale => {
                        const t = post.post_translations.find(row => row.locale === locale)

                        return (
                          <span key={locale} className='block'>
                            {locale} / {t?.slug ?? '—'}
                          </span>
                        )
                      })}
                    </TableCell>

                    <TableCell>
                      <PostRowActions
                        postKey={post.key}
                        title={title}
                        archived={post.archived_at !== null}
                      />
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

export default AdminPostsPage
