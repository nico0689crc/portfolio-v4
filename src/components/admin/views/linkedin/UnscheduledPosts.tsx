'use client'

// React Imports
import { useMemo, useState } from 'react'

// Third-party Imports
import { CalendarPlus, Search } from 'lucide-react'

// Component Imports
import { Input } from '@/components/admin/ui/input'
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
  autoMessage: string
  /** Sin portada no hay miniatura para el PDF, que Buffer exige. */
  hasCover: boolean
}

/**
 * Los artículos que todavía no tienen turno.
 *
 * El buscador es del lado del cliente a propósito: son unas decenas de filas,
 * ya están todas en memoria, y filtrar contra el server metería una recarga
 * entre tecla y tecla para no ganar nada.
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

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()

    if (!needle) return candidates

    return candidates.filter(c => `${c.title} ${c.key}`.toLowerCase().includes(needle))
  }, [candidates, query])

  return (
    <div className='flex flex-col gap-3'>
      <div className='relative'>
        <Search className='text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2' />
        <Input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder='Buscar artículo…'
          className='pl-9'
          aria-label='Buscar artículo'
        />
      </div>

      {visible.length === 0 ? (
        <p className='text-muted-foreground rounded-lg border border-dashed p-8 text-center text-sm'>
          {candidates.length === 0 ? 'Todo lo publicado ya tiene turno.' : 'Nada coincide con la búsqueda.'}
        </p>
      ) : (
        <ul className='divide-border border-border divide-y rounded-lg border'>
          {visible.map(candidate => (
            <li key={candidate.postId} className='flex items-center justify-between gap-3 p-3'>
              <div className='min-w-0'>
                <p className='truncate text-sm font-medium' title={candidate.title}>
                  {candidate.title}
                </p>
                <p className='text-muted-foreground text-xs'>
                  {candidate.publishedAt ? `publicado ${shortDate(candidate.publishedAt)}` : 'sin fecha'}
                  {/* Una nota ya compartida vuelve a la lista a propósito
                      —recircular es el caso más valioso del archivo— pero sin
                      decirlo se repetiría sin querer. */}
                  {candidate.lastSharedAt && (
                    <span className='text-amber-600 dark:text-amber-500'>
                      {' '}
                      · ya salió el {shortDate(candidate.lastSharedAt)}
                    </span>
                  )}
                </p>
              </div>

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
                defaultLinkInFirstComment={false}
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
    </div>
  )
}

export default UnscheduledPosts
