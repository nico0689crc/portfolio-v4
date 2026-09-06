'use client'

// React Imports
import { useEffect, useState, useTransition } from 'react'

// Next Imports
import Link from 'next/link'

// Third-party Imports
import {
  CalendarPlus,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  CircleSlash,
  ExternalLink,
  MoreHorizontal,
  Pencil,
  Search
} from 'lucide-react'
import { toast } from 'sonner'

// Component Imports
import { Badge } from '@/components/admin/ui/badge'
import { Button } from '@/components/admin/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/admin/ui/dropdown-menu'
import { Input } from '@/components/admin/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/admin/ui/select'
import CoverThumb from './CoverThumb'
import ScheduleDialog from './ScheduleDialog'

// Lib Imports
import { formatPanelDate } from '@/lib/admin/dates'
import { cn } from '@/lib/utils'
import { listUnscheduled, setShareDecision } from '@/lib/admin/social-actions'
import type {
  BlogFilter,
  Candidate,
  CandidateFilter,
  CandidatePage,
  ShareDecision
} from '@/lib/admin/linkedin-candidates'

/** Fecha corta, en el formato que usa el resto del panel. */
const shortDate = (value: string) =>
  formatPanelDate(value, { day: 'numeric', month: 'short', year: 'numeric' })

/**
 * Dos controles y no tres.
 *
 * Hay tres preguntas encima de la misma lista: ¿la aprobé?, ¿ya salió?, ¿está
 * en el blog? Un select por cada una convertía la columna en un tablero. Las
 * dos primeras se preguntan casi siempre juntas —«qué me falta»— así que van en
 * un solo select cuya opción por defecto es esa intersección, y las demás abren
 * cada mitad cuando hace falta. La tercera es del artículo y no de la difusión,
 * así que queda en su propio control de tres opciones.
 *
 * El primero de cada lista tiene que ser el que trae el server.
 */
const FILTERS: { value: CandidateFilter; label: string }[] = [
  { value: 'to-schedule', label: 'Para programar' },
  { value: 'undecided', label: 'Sin decidir' },
  { value: 'approved', label: 'Aprobados' },
  { value: 'discarded', label: 'Descartados' },
  { value: 'shared', label: 'Ya salieron' },
  { value: 'all', label: 'Todos' }
]

const BLOG_FILTERS: { value: BlogFilter; label: string }[] = [
  { value: 'all', label: 'Todo el blog' },
  { value: 'live', label: 'Ya en el blog' },
  { value: 'upcoming', label: 'Aún sin salir' }
]

const DEFAULT_FILTER = FILTERS[0].value
const DEFAULT_BLOG = BLOG_FILTERS[0].value

/** El texto del vacío según por qué quedó vacío. Un cartel genérico no dice qué probar. */
const EMPTY: Record<CandidateFilter, string> = {
  'to-schedule': 'No queda nada por decidir ni por programar. Probá «Ya salieron» para recircular el archivo.',
  undecided: 'Todo el archivo ya está aprobado o descartado.',
  approved: 'Todavía no aprobaste ninguno.',
  discarded: 'No descartaste ninguno.',
  shared: 'Todavía no salió ninguno en LinkedIn.',
  all: 'Todo lo publicado ya tiene turno.'
}

/**
 * Lo que tarda el buscador en salir a buscar.
 *
 * Cada búsqueda es una vuelta al server, así que escribir «arquitectura» sin
 * esto son doce consultas para mostrar el resultado de la última.
 */
const DEBOUNCE_MS = 300

/**
 * Los artículos que todavía no tienen turno.
 *
 * La primera página llega renderizada del server y el resto —cambiar de página,
 * buscar, filtrar— se pide por un action sin recargar nada. Antes venían los
 * cincuenta y pico en el HTML con el texto por defecto de cada uno adentro; con
 * la miniatura al lado eso pasaba a ser además cincuenta imágenes de arranque.
 */
const UnscheduledPosts = ({
  initial,
  nextSlotLocal,
  nextSlotLabel
}: {
  /** La primera página, tal como la dejó el server. */
  initial: CandidatePage
  /** Turno sugerido en formato `datetime-local`, ya calculado por el server. */
  nextSlotLocal: string
  /** El mismo turno, legible, para que el botón diga adónde va antes de abrirlo. */
  nextSlotLabel: string
}) => {
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<CandidateFilter>(DEFAULT_FILTER)
  const [blog, setBlog] = useState<BlogFilter>(DEFAULT_BLOG)
  const [page, setPage] = useState(1)

  // Se incrementa con cada decisión. `revalidatePath` refresca la vista por
  // defecto sola, pero una lista filtrada cuelga de datos que el server no
  // volvió a mandar: aprobar desde «Sin decidir» dejaba la fila ahí, ya
  // aprobada, hasta el próximo cambio de página.
  const [decided, setDecided] = useState(0)

  // Un diálogo para toda la lista y no uno por fila: el disparador ahora es un
  // ítem de menú, que se cierra al hacer clic, así que la apertura la maneja
  // esto y no el propio diálogo.
  const [scheduling, setScheduling] = useState<Candidate | null>(null)

  // Lo último que trajo el action, etiquetado con la vista a la que pertenece.
  // La etiqueta es lo que evita tener que limpiar el estado desde un efecto: si
  // no coincide con lo que se está mirando, esto es lo viejo y no la respuesta.
  const [fetched, setFetched] = useState<{ view: string; data: CandidatePage } | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    const id = setTimeout(() => setSearch(query.trim()), DEBOUNCE_MS)

    return () => clearTimeout(id)
  }, [query])

  // Qué trajo el server la última vez. Cuando un envío se programa, la página
  // se revalida y esta firma cambia: es la señal de que la lista de la que
  // colgaba la página que se está viendo ya no es la misma.
  const revision = `${initial.total}:${initial.items.map(item => item.postId).join()}`

  const isServerView = page === 1 && search === '' && filter === DEFAULT_FILTER && blog === DEFAULT_BLOG

  // Mientras la respuesta no llega se muestra lo anterior y no un vacío: en una
  // lista de diez filas el salto y la vuelta se leen peor que el medio segundo
  // de datos viejos. `isPending` es lo que avisa que son viejos.
  const data = isServerView ? initial : (fetched?.data ?? initial)

  // Programar el último de la página la deja fuera de rango. Se corrige al
  // vuelo en vez de sincronizar el estado desde un efecto: la página que existe
  // es una cuenta, no una decisión que haya que guardar.
  const current = Math.min(Math.max(1, page), data.pages)

  const view = `${current}|${search}|${filter}|${blog}|${revision}|${decided}`

  useEffect(() => {
    if (isServerView) return

    let live = true

    startTransition(async () => {
      const next = await listUnscheduled({ page: current, query: search, filter, blog })

      if (live) setFetched({ view, data: next })
    })

    return () => {
      live = false
    }
  }, [isServerView, view, current, search, filter, blog])

  /** Filtrar o buscar vuelve al principio: la página 3 de otra lista no significa nada. */
  const reset = (apply: () => void) => {
    apply()
    setPage(1)
  }

  /**
   * Aprobar, descartar o volver atrás.
   *
   * Cada ítem del menú es un interruptor: si la nota ya está en ese estado, lo
   * quita. Así pasar de aprobada a descartada es un clic y no dos, y no hace
   * falta un tercer ítem para «sin decidir».
   */
  const decide = (candidate: Candidate, decision: Exclude<ShareDecision, null>) =>
    startTransition(async () => {
      const next = candidate.decision === decision ? null : decision
      const { error } = await setShareDecision(candidate.postId, next)

      if (error) {
        toast.error(error)

        return
      }

      toast.success(
        next === 'approved' ? 'Aprobado' : next === 'discarded' ? 'Descartado' : 'Sin decidir'
      )
      setDecided(count => count + 1)
    })

  return (
    <div className='flex flex-col gap-3'>
      <div className='relative'>
        <Search className='text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2' />
        <Input
          value={query}
          onChange={e => reset(() => setQuery(e.target.value))}
          placeholder='Buscar artículo…'
          className='pl-9'
          aria-label='Buscar artículo'
        />
      </div>

      <div className='flex gap-2'>
        <Select
          value={filter}
          onValueChange={value => reset(() => setFilter(value as CandidateFilter))}
          items={FILTERS}
        >
          <SelectTrigger className='flex-1' aria-label='Filtrar por curaduría'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FILTERS.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={blog}
          onValueChange={value => reset(() => setBlog(value as BlogFilter))}
          items={BLOG_FILTERS}
        >
          <SelectTrigger className='flex-1' aria-label='Filtrar por estado en el blog'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {BLOG_FILTERS.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {data.error ? (
        <p className='border-destructive/30 bg-destructive/10 text-destructive rounded-lg border p-3 text-sm'>
          No se pudo cargar la lista: {data.error}
        </p>
      ) : data.items.length === 0 ? (
        <p className='text-muted-foreground rounded-lg border border-dashed p-8 text-center text-sm'>
          {isPending
            ? 'Buscando…'
            : search
              ? 'Nada coincide con la búsqueda.'
              : blog !== DEFAULT_BLOG
                ? 'Nada con ese estado en el blog. Probá «Todo el blog».'
                : EMPTY[filter]}
        </p>
      ) : (
        /* La lista anterior se queda a la vista mientras carga la siguiente: en
           una lista de diez filas el salto a un vacío y de vuelta se lee peor
           que el medio segundo de datos viejos. */
        <ul
          aria-busy={isPending}
          className={cn(
            'divide-border border-border divide-y rounded-lg border transition-opacity',
            isPending && 'opacity-60'
          )}
        >
          {data.items.map(candidate => (
            <li
              key={candidate.postId}
              className={cn(
                'flex items-center gap-3 p-3',
                // Lo descartado sigue en la lista sólo cuando se lo pide; que se
                // vea apagado evita confundirlo con lo que sí espera turno.
                candidate.decision === 'discarded' && 'opacity-60'
              )}
            >
              <CoverThumb url={candidate.coverUrl} />

              <div className='min-w-0 flex-1'>
                <div className='flex items-center gap-2'>
                  {/* La decisión va como glifo y no como segundo badge: al lado
                      del estado del blog, dos etiquetas de texto no entran sin
                      comerse el título, que es lo que se lee primero. */}
                  {candidate.decision === 'approved' && (
                    <CircleCheck
                      className='size-4 shrink-0 text-emerald-600 dark:text-emerald-500'
                      aria-label='Aprobado para difundir'
                    />
                  )}
                  {candidate.decision === 'discarded' && (
                    <CircleSlash
                      className='text-muted-foreground size-4 shrink-0'
                      aria-label='Descartado para difundir'
                    />
                  )}
                  <p className='truncate text-sm font-medium' title={candidate.title}>
                    {candidate.title}
                  </p>
                  {/* El badge es del artículo: pendiente significa que todavía
                      no se ve en el blog, y difundir eso lleva a una vista
                      previa. Que ya haya salido en LinkedIn va abajo, porque no
                      impide nada —recircular es el caso más valioso— pero sin
                      decirlo la nota se repetiría sin querer. */}
                  <Badge
                    className={
                      candidate.isLive
                        ? 'shrink-0 bg-emerald-600/10 text-emerald-600 dark:text-emerald-500'
                        : 'shrink-0 bg-amber-600/10 text-amber-600 dark:text-amber-500'
                    }
                  >
                    {candidate.isLive ? 'Publicado' : 'Pendiente'}
                  </Badge>
                </div>
                <p className='text-muted-foreground text-xs'>
                  {!candidate.publishedAt
                    ? 'sin fecha'
                    : candidate.isLive
                      ? `publicado ${shortDate(candidate.publishedAt)}`
                      : `sale el ${shortDate(candidate.publishedAt)}`}
                  {candidate.lastSharedAt && ` · a LinkedIn el ${shortDate(candidate.lastSharedAt)}`}
                </p>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant='ghost'
                      size='icon'
                      className='shrink-0'
                      aria-label={`Acciones de «${candidate.title}»`}
                    />
                  }
                >
                  <MoreHorizontal className='size-4' />
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end' className='w-60'>
                  {/* El turno sugerido es el mismo para todos los de la lista:
                      el primero que se programe corre al siguiente, y la página
                      se revalida con el turno nuevo ya calculado. */}
                  <DropdownMenuItem onClick={() => setScheduling(candidate)}>
                    <CalendarPlus />
                    <span className='truncate'>Programar {nextSlotLabel}</span>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem disabled={isPending} onClick={() => decide(candidate, 'approved')}>
                    <CircleCheck />
                    <span>{candidate.decision === 'approved' ? 'Quitar aprobación' : 'Aprobar'}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem disabled={isPending} onClick={() => decide(candidate, 'discarded')}>
                    <CircleSlash />
                    <span>{candidate.decision === 'discarded' ? 'Quitar descarte' : 'Descartar'}</span>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    render={<a href={candidate.postUrl} target='_blank' rel='noopener noreferrer' />}
                  >
                    <ExternalLink />
                    <span>{candidate.isLive ? 'Ver artículo' : 'Ver vista previa'}</span>
                  </DropdownMenuItem>
                  {/* Al panel y en la misma pestaña: corregir el título o la
                      bajada antes de programar cambia el texto que va a salir,
                      así que es parte del mismo trabajo y no una consulta. */}
                  <DropdownMenuItem render={<Link href={`/admin/posts/${candidate.key}`} />}>
                    <Pencil />
                    <span>Editar artículo</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </li>
          ))}
        </ul>
      )}

      {scheduling && (
        <ScheduleDialog
          open
          onOpenChange={() => setScheduling(null)}
          postId={scheduling.postId}
          title={scheduling.title}
          defaultScheduledAt={nextSlotLocal}
          defaultMessage=''
          autoMessage={scheduling.autoMessage}
          defaultMedia='article'
          // Con tarjeta el switch ni se ve, pero queda guardado: si más tarde se
          // cambia la media, el link tiene adónde ir en vez de desaparecer.
          defaultLinkInFirstComment
          currentDocument={null}
          hasCover={scheduling.coverUrl !== null}
        />
      )}

      {/* Con el filtro puesto la cuenta del encabezado deja de coincidir con lo
          que se ve, y sin esto no hay forma de saber cuánto quedó afuera. */}
      {data.items.length > 0 && (
        <div className='flex items-center justify-between gap-3'>
          <p className='text-muted-foreground text-xs'>
            {data.from}–{data.from + data.items.length - 1} de {data.matching}
            {data.matching < data.total && ` (${data.total} sin turno)`}
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
      )}
    </div>
  )
}

export default UnscheduledPosts
