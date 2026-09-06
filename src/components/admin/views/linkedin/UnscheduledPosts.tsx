'use client'

// React Imports
import { useMemo, useState } from 'react'

// Third-party Imports
import { CalendarPlus, ExternalLink, Search } from 'lucide-react'

// Component Imports
import { Badge } from '@/components/admin/ui/badge'
import { Button } from '@/components/admin/ui/button'
import { Input } from '@/components/admin/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/admin/ui/select'
import ScheduleDialog from './ScheduleDialog'

/** Fecha corta, en el formato que usa el resto del panel. */
const shortDate = (value: string) =>
  new Date(value).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })

export type Candidate = {
  postId: string
  key: string
  title: string
  publishedAt: string | null
  /** Cuándo salió por última vez, si ya salió. Evita repetirla sin querer. */
  lastSharedAt: string | null
  /** El texto que saldría si el campo queda vacío. Nunca incluye la URL. */
  autoMessage: string
  /** El artículo en el sitio, para ir a mirarlo antes de programarlo. */
  postUrl: string
  /** Sin portada no hay miniatura para el PDF, que Buffer exige. */
  hasCover: boolean
}

/**
 * El filtro abre en «Pendientes», no en «Todos».
 *
 * La lista mezcla dos trabajos que se hacen en momentos distintos: llenar la
 * agenda con lo que nunca salió, que es lo de todas las semanas, y recircular
 * el archivo, que es ocasional. Abrir en «Todos» enterraba lo primero entre
 * notas que ya salieron.
 */
const FILTERS = [
  { value: 'pending', label: 'Pendientes' },
  { value: 'shared', label: 'Ya publicados' },
  { value: 'all', label: 'Todos' }
]

/**
 * Los artículos que todavía no tienen turno.
 *
 * El buscador y el filtro son del lado del cliente a propósito: son unas
 * decenas de filas, ya están todas en memoria, y filtrar contra el server
 * metería una recarga entre tecla y tecla para no ganar nada.
 */
const UnscheduledPosts = ({
  candidates,
  nextSlotLocal,
  nextSlotLabel
}: {
  candidates: Candidate[]
  /** Turno sugerido en formato `datetime-local`, ya calculado por el server. */
  nextSlotLocal: string
  /** El mismo turno, legible, para que el botón diga adónde va antes de abrirlo. */
  nextSlotLabel: string
}) => {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('pending')

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()

    return candidates.filter(candidate => {
      if (filter === 'pending' && candidate.lastSharedAt) return false
      if (filter === 'shared' && !candidate.lastSharedAt) return false

      return !needle || `${candidate.title} ${candidate.key}`.toLowerCase().includes(needle)
    })
  }, [candidates, filter, query])

  return (
    <div className='flex flex-col gap-3'>
      <div className='flex gap-2'>
        <div className='relative flex-1'>
          <Search className='text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2' />
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder='Buscar artículo…'
            className='pl-9'
            aria-label='Buscar artículo'
          />
        </div>

        <Select value={filter} onValueChange={value => setFilter(value as string)} items={FILTERS}>
          <SelectTrigger className='w-40 shrink-0' aria-label='Filtrar por estado'>
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
      </div>

      {visible.length === 0 ? (
        <p className='text-muted-foreground rounded-lg border border-dashed p-8 text-center text-sm'>
          {query.trim()
            ? 'Nada coincide con la búsqueda.'
            : filter === 'pending'
              ? 'No queda nada sin salir. Probá «Ya publicados» para recircular el archivo.'
              : filter === 'shared'
                ? 'Todavía no salió ninguno.'
                : 'Todo lo publicado ya tiene turno.'}
        </p>
      ) : (
        <ul className='divide-border border-border divide-y rounded-lg border'>
          {visible.map(candidate => (
            <li key={candidate.postId} className='flex items-center gap-2 p-3'>
              <div className='min-w-0 flex-1'>
                <div className='flex items-center gap-2'>
                  <p className='truncate text-sm font-medium' title={candidate.title}>
                    {candidate.title}
                  </p>
                  {/* Una nota ya compartida vuelve a la lista a propósito
                      —recircular es el caso más valioso del archivo— pero sin
                      decirlo se repetiría sin querer. */}
                  <Badge
                    className={
                      candidate.lastSharedAt
                        ? 'shrink-0 bg-emerald-600/10 text-emerald-600 dark:text-emerald-500'
                        : 'bg-muted text-muted-foreground shrink-0'
                    }
                  >
                    {candidate.lastSharedAt ? 'Publicado' : 'Pendiente'}
                  </Badge>
                </div>
                <p className='text-muted-foreground text-xs'>
                  {candidate.publishedAt ? `publicado ${shortDate(candidate.publishedAt)}` : 'sin fecha'}
                  {candidate.lastSharedAt && ` · salió el ${shortDate(candidate.lastSharedAt)}`}
                </p>
              </div>

              <Button
                variant='ghost'
                size='icon'
                aria-label={`Ver «${candidate.title}» en el sitio`}
                render={<a href={candidate.postUrl} target='_blank' rel='noopener noreferrer' />}
              >
                <ExternalLink className='size-4' />
              </Button>

              {/* El turno sugerido es el mismo para todos los de la lista: el
                  primero que se programe corre al siguiente, y la página se
                  revalida con el turno nuevo ya calculado. */}
              <ScheduleDialog
                postId={candidate.postId}
                title={candidate.title}
                defaultScheduledAt={nextSlotLocal}
                defaultMessage=''
                autoMessage={candidate.autoMessage}
                defaultMedia='article'
                // Con tarjeta el switch ni se ve, pero queda guardado: si más
                // tarde se cambia la media, el link tiene adónde ir en vez de
                // desaparecer.
                defaultLinkInFirstComment
                currentDocument={null}
                hasCover={candidate.hasCover}
                triggerLabel={
                  <>
                    <CalendarPlus className='size-4' /> {nextSlotLabel}
                  </>
                }
              />
            </li>
          ))}
        </ul>
      )}

      {/* Con el filtro puesto la cuenta del encabezado deja de coincidir con lo
          que se ve, y sin esto no hay forma de saber cuánto quedó afuera. */}
      {visible.length < candidates.length && (
        <p className='text-muted-foreground text-xs'>
          Mostrando {visible.length} de {candidates.length} sin turno.
        </p>
      )}
    </div>
  )
}

export default UnscheduledPosts
