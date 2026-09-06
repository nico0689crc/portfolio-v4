'use client'

// React Imports
import { useEffect, useState, useTransition } from 'react'

// Third-party Imports
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, ImageOff } from 'lucide-react'

// Next Imports
import Image from 'next/image'

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
import PostRowActions from './PostRowActions'

// Lib Imports
import { formatPanelDate } from '@/lib/admin/dates'
import { listPostsPage } from '@/lib/admin/posts-actions'
import { cn } from '@/lib/utils'
import type { PostFilter, PostSort, PostsPage } from '@/lib/admin/posts-list'

/** El primero es el que trae el server. */
const FILTERS: { key: PostFilter; label: string }[] = [
  { key: 'todos', label: 'Todos' },
  { key: 'publicados', label: 'Publicados' },
  { key: 'borradores', label: 'Borradores' },
  { key: 'archivados', label: 'Archivados' }
]

const DEFAULT_FILTER = FILTERS[0].key
const DEFAULT_SORT: PostSort = 'creado'

/** Fecha corta con hora: en los programados importa a qué hora sale. */
const formatDate = (value: string) =>
  formatPanelDate(value, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

/**
 * El listado de artículos.
 *
 * La primera página llega renderizada del server y el resto —cambiar de página,
 * de filtro o de orden— se pide por un action sin recargar nada. Antes cada uno
 * de esos tres era una navegación con su `?estado=&orden=`: se perdió el estado
 * en la URL, y a cambio la tabla dejó de parpadear entera para cambiar diez
 * filas.
 */
const PostsList = ({ initial }: { initial: PostsPage }) => {
  const [filter, setFilter] = useState<PostFilter>(DEFAULT_FILTER)
  const [sort, setSort] = useState<PostSort>(DEFAULT_SORT)
  const [page, setPage] = useState(1)

  // Se incrementa al archivar o restaurar. `revalidatePath` refresca la vista
  // por defecto sola, pero una lista filtrada cuelga de datos que el server no
  // volvió a mandar: archivar desde «Borradores» dejaba la fila ahí.
  const [changes, setChanges] = useState(0)

  // Lo último que trajo el action, etiquetado con la vista a la que pertenece.
  // La etiqueta es lo que evita tener que limpiar el estado desde un efecto: si
  // no coincide con lo que se está mirando, esto es lo viejo y no la respuesta.
  const [fetched, setFetched] = useState<{ view: string; data: PostsPage } | null>(null)
  const [isPending, startTransition] = useTransition()

  const isServerView = page === 1 && filter === DEFAULT_FILTER && sort === DEFAULT_SORT

  // Mientras la respuesta no llega se muestra lo anterior y no un vacío: en una
  // tabla de diez filas el salto y la vuelta se leen peor que el medio segundo
  // de datos viejos. `isPending` es lo que avisa que son viejos.
  const data = isServerView ? initial : (fetched?.data ?? initial)

  // Archivar o borrar la última fila deja la página fuera de rango. Se corrige
  // al vuelo en vez de sincronizar el estado desde un efecto: la página que
  // existe es una cuenta, no una decisión que haya que guardar.
  const current = Math.min(Math.max(1, page), data.pages)

  // Qué trajo el server la última vez. Archivar o borrar revalida la página y
  // esta firma cambia: es la señal de que la lista de la que colgaba lo que se
  // está viendo ya no es la misma.
  const revision = `${initial.total}:${initial.items.map(item => item.key).join()}`
  const view = `${current}|${filter}|${sort}|${revision}|${changes}`

  useEffect(() => {
    if (isServerView) return

    let live = true

    startTransition(async () => {
      const next = await listPostsPage({ page: current, filter, sort })

      if (live) setFetched({ view, data: next })
    })

    return () => {
      live = false
    }
  }, [isServerView, view, current, filter, sort])

  /** Cambiar de filtro o de orden vuelve al principio: la página 3 de otra lista no significa nada. */
  const reset = (apply: () => void) => {
    apply()
    setPage(1)
  }

  const SortIcon = sort === 'fecha-desc' ? ArrowDown : sort === 'fecha-asc' ? ArrowUp : ArrowUpDown

  return (
    <>
      <div className='flex flex-wrap gap-1'>
        {FILTERS.map(item => (
          <Button
            key={item.key}
            size='sm'
            variant={filter === item.key ? 'default' : 'outline'}
            disabled={isPending}
            onClick={() => reset(() => setFilter(item.key))}
          >
            {item.label} ({data.counts[item.key]})
          </Button>
        ))}
      </div>

      {data.error ? (
        <p className='border-destructive/30 bg-destructive/10 text-destructive rounded-lg border p-3 text-sm'>
          No se pudieron cargar los posts: {data.error}
        </p>
      ) : data.items.length === 0 ? (
        <p className='text-muted-foreground rounded-lg border border-dashed p-10 text-center text-sm'>
          {data.total === 0
            ? 'Todavía no escribiste ninguno. Empezá por el título.'
            : 'No hay artículos en este estado.'}
        </p>
      ) : (
        <>
          <div
            aria-busy={isPending}
            className={cn(
              'border-border rounded-lg border transition-opacity',
              isPending && 'opacity-60'
            )}
          >
            <Table className='table-fixed'>
              <TableHeader>
                <TableRow>
                  <TableHead className='w-16' />
                  <TableHead>Título</TableHead>
                  <TableHead className='w-52'>
                    {/* La cabecera es el control de orden: alterna asc/desc y
                        arranca por descendente, que es lo que se mira primero. */}
                    <button
                      type='button'
                      onClick={() =>
                        reset(() => setSort(sort === 'fecha-desc' ? 'fecha-asc' : 'fecha-desc'))
                      }
                      className='hover:text-accent inline-flex items-center gap-1'
                    >
                      Publicación
                      <SortIcon className={cn('size-3.5', sort === 'creado' && 'opacity-50')} />
                    </button>
                  </TableHead>
                  <TableHead className='w-16 text-right'>
                    <span className='sr-only'>Acciones</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map(post => (
                  <TableRow key={post.key} className={post.archived ? 'opacity-60' : undefined}>
                    <TableCell>
                      {/* Sin portada, el hueco tachado en vez de un cuadrado
                          gris: es la lista donde se ve de un vistazo a cuáles
                          les falta la imagen. */}
                      <div className='bg-muted relative size-12 overflow-hidden rounded-md'>
                        {post.coverUrl ? (
                          <Image
                            src={post.coverUrl}
                            alt=''
                            fill
                            sizes='48px'
                            className='object-cover'
                          />
                        ) : (
                          <ImageOff className='text-muted-foreground/60 absolute top-1/2 left-1/2 size-4 -translate-x-1/2 -translate-y-1/2' />
                        )}
                      </div>
                    </TableCell>

                    <TableCell className='font-medium'>
                      <span className='block truncate' title={post.title}>
                        {post.title}
                      </span>
                    </TableCell>

                    <TableCell>
                      <Badge
                        className={
                          post.isLive
                            ? 'bg-emerald-600/10 text-emerald-600 dark:text-emerald-500'
                            : 'bg-amber-600/10 text-amber-600 dark:text-amber-500'
                        }
                      >
                        {post.isLive ? 'Publicado' : 'Pendiente'}
                      </Badge>
                      <span className='text-muted-foreground mt-1 block truncate text-xs'>
                        {post.publishedAt ? formatDate(post.publishedAt) : 'Sin programar'}
                      </span>
                    </TableCell>

                    <TableCell className='text-right'>
                      <PostRowActions
                        postKey={post.key}
                        title={post.title}
                        archived={post.archived}
                        liveUrl={post.liveUrl}
                        onChanged={() => setChanges(count => count + 1)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className='flex items-center justify-between gap-3'>
            <p className='text-muted-foreground text-xs'>
              {data.from}–{data.from + data.items.length - 1} de {data.matching}
            </p>

            {data.pages > 1 && (
              <nav aria-label='Paginación' className='flex items-center gap-1'>
                <Button
                  variant='ghost'
                  size='icon'
                  aria-label='Página anterior'
                  disabled={current <= 1 || isPending}
                  onClick={() => setPage(current - 1)}
                >
                  <ChevronLeft className='size-4' />
                </Button>
                <span className='text-muted-foreground text-xs tabular-nums'>
                  {current} / {data.pages}
                </span>
                <Button
                  variant='ghost'
                  size='icon'
                  aria-label='Página siguiente'
                  disabled={current >= data.pages || isPending}
                  onClick={() => setPage(current + 1)}
                >
                  <ChevronRight className='size-4' />
                </Button>
              </nav>
            )}
          </div>
        </>
      )}
    </>
  )
}

export default PostsList
