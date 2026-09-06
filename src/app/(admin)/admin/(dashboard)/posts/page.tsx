// Next Imports
import Link from 'next/link'
import Image from 'next/image'

// Third-party Imports
import { ArrowDown, ArrowUp, ArrowUpDown, Plus } from 'lucide-react'

// Component Imports
import { Badge } from '@/components/admin/ui/badge'
import { Button } from '@/components/admin/ui/button'
import PostRowActions from '@/components/admin/views/posts/PostRowActions'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/admin/ui/table'

// Lib Imports
import { DEFAULT_LOCALE } from '@/i18n/locales'
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

/** `creado` es el orden por defecto y el que ya trae la consulta. */
type Sort = 'creado' | 'fecha-asc' | 'fecha-desc'

const LOCALES = ['es', 'en'] as const

/** Fecha corta con hora: en los programados importa a qué hora sale. */
const formatDate = (value: string) =>
  new Date(value).toLocaleString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

/**
 * La publicación se agenda con `published_at` a futuro, así que la fecha sola no
 * alcanza: hay que compararla contra ahora para saber si ya salió o falta.
 */
const publishState = (dates: (string | null)[]) => {
  const scheduled = dates.filter((d): d is string => d !== null).sort()

  if (scheduled.length === 0) return { date: null, published: false }

  return { date: scheduled[0], published: scheduled[0] <= new Date().toISOString() }
}

/**
 * Adónde apunta el slug de cada idioma.
 *
 * Lo ya publicado va a la URL real; lo que sigue en borrador o está agendado a
 * futuro todavía no existe en el sitio, así que va a la vista previa. Un link
 * que da 404 la mitad de las veces no sirve para revisar nada.
 */
const translationUrl = (
  postKey: string,
  locale: string,
  slug: string,
  live: boolean
) => {
  const prefix = locale === DEFAULT_LOCALE ? '' : `/${locale}`

  return live ? `${prefix}/blog/${slug}` : `/${locale}/preview/blog/${postKey}`
}

const AdminPostsPage = async ({
  searchParams
}: {
  searchParams: Promise<{ estado?: string; orden?: string }>
}) => {
  const { estado, orden } = await searchParams
  const filter: Filter = FILTERS.some(f => f.key === estado) ? (estado as Filter) : 'todos'
  const sort: Sort = orden === 'fecha-asc' || orden === 'fecha-desc' ? orden : 'creado'

  /** Conserva el filtro activo al cambiar el orden y viceversa. */
  const listHref = (next: { estado?: Filter; orden?: Sort }) => {
    const params = new URLSearchParams()
    const nextFilter = next.estado ?? filter
    const nextSort = next.orden ?? sort

    if (nextFilter !== 'todos') params.set('estado', nextFilter)
    if (nextSort !== 'creado') params.set('orden', nextSort)

    const qs = params.toString()

    return qs ? `/admin/posts?${qs}` : '/admin/posts'
  }

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

  // El orden por fecha se resuelve acá y no en SQL por lo mismo que el filtro:
  // `published_at` vive en las traducciones, y ordenar por una tabla embebida
  // reordenaría las traducciones dentro de cada post, no los posts entre sí.
  if (sort !== 'creado') {
    const direction = sort === 'fecha-asc' ? 1 : -1

    posts.sort((a, b) => {
      const dateA = publishState(a.post_translations.map(t => t.published_at)).date
      const dateB = publishState(b.post_translations.map(t => t.published_at)).date

      // Sin fecha siempre al final, ordene como ordene: son los que todavía no
      // tienen nada agendado y no compiten con los que sí.
      if (dateA === null || dateB === null) return dateA === dateB ? 0 : dateA === null ? 1 : -1

      return dateA < dateB ? -direction : dateA > dateB ? direction : 0
    })
  }

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
            render={<Link href={listHref({ estado: item.key })} />}
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
          <Table className='table-fixed'>
            <TableHeader>
              <TableRow>
                <TableHead className='w-16' />
                <TableHead>Título</TableHead>
                <TableHead className='w-48'>Estado</TableHead>
                <TableHead className='w-52'>
                  {/* La cabecera es el control de orden: alterna asc/desc y
                      arranca por descendente, que es lo que se mira primero. */}
                  <Link
                    href={listHref({ orden: sort === 'fecha-desc' ? 'fecha-asc' : 'fecha-desc' })}
                    className='hover:text-accent inline-flex items-center gap-1'
                  >
                    Publicación
                    {sort === 'fecha-desc' ? (
                      <ArrowDown className='size-3.5' />
                    ) : sort === 'fecha-asc' ? (
                      <ArrowUp className='size-3.5' />
                    ) : (
                      <ArrowUpDown className='size-3.5 opacity-50' />
                    )}
                  </Link>
                </TableHead>
                <TableHead className='w-44 text-right'>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map(post => {
                const es = post.post_translations.find(t => t.locale === 'es')
                const title = es?.title ?? post.key
                const publish = publishState(post.post_translations.map(t => t.published_at))
                const now = new Date().toISOString()
                const slugs = LOCALES.map(locale => {
                  const t = post.post_translations.find(row => row.locale === locale)
                  const live = t?.status === 'published' && t.published_at !== null && t.published_at <= now

                  return {
                    locale,
                    value: `${locale} /${t?.slug ?? '—'}`,
                    href: t ? translationUrl(post.key, locale, t.slug, live) : null,
                    live
                  }
                })

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
                      <span className='block truncate' title={title}>
                        {title}
                      </span>
                      {slugs.map(slug =>
                        slug.href ? (
                          <Link
                            key={slug.locale}
                            href={slug.href}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='text-muted-foreground hover:text-foreground block truncate font-mono text-xs font-normal hover:underline'
                            title={slug.live ? slug.value : `${slug.value} (vista previa)`}
                          >
                            {slug.value}
                          </Link>
                        ) : (
                          <span
                            key={slug.locale}
                            className='text-muted-foreground block truncate font-mono text-xs font-normal'
                          >
                            {slug.value}
                          </span>
                        )
                      )}
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

                    <TableCell>
                      <Badge
                        className={
                          publish.published
                            ? 'bg-emerald-600/10 text-emerald-600 dark:text-emerald-500'
                            : 'bg-amber-600/10 text-amber-600 dark:text-amber-500'
                        }
                      >
                        {publish.published ? 'Publicado' : 'Pendiente'}
                      </Badge>
                      <span className='text-muted-foreground mt-1 block truncate text-xs'>
                        {publish.date ? formatDate(publish.date) : 'Sin programar'}
                      </span>
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
