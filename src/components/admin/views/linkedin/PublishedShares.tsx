'use client'

// React Imports
import { useState, useTransition } from 'react'

// Third-party Imports
import { toast } from 'sonner'
import { ExternalLink, MoreHorizontal, ScrollText, Trash2 } from 'lucide-react'

// Component Imports
import { Button } from '@/components/admin/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/admin/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/admin/ui/dropdown-menu'
import CoverThumb from './CoverThumb'

// Lib Imports
import { formatPanelDate } from '@/lib/admin/dates'
import { deleteShare } from '@/lib/admin/social-actions'

/** Cuántos se listan antes de esconder el resto detrás del botón. */
const PREVIEW = 8

export type PublishedShare = {
  id: string
  title: string
  /** Cuándo salió realmente. Null sólo si la fila es anterior a que se registrara. */
  deliveredAt: string | null
  scheduledAt: string
  /** Cómo se lee el estado: «Publicado» o «En Buffer» mientras Buffer lo retiene. */
  label: string
  /** Por dónde salió. Cambia si hay permalink y si el primer comentario existió. */
  provider: 'linkedin' | 'buffer'
  media: 'auto' | 'article' | 'document' | 'none'
  linkInFirstComment: boolean
  /** El texto tal cual salió: el escrito a mano, o el que se armó al entregar. */
  text: string
  /** Si el texto lo escribió el editor o lo armó el sistema con lo vigente. */
  textIsCustom: boolean
  /** El posteo en LinkedIn, cuando se puede armar la URL. */
  postUrl: string | null
  /** Un aviso —casi siempre el primer comentario que no salió—, no un fallo. */
  warning: string | null
  /** La portada del artículo, para la miniatura de la fila. */
  coverUrl: string | null
}

const MEDIA_LABEL: Record<PublishedShare['media'], string> = {
  auto: 'Portada del artículo',
  article: 'Tarjeta de enlace',
  document: 'Carrusel (PDF)',
  none: 'Sin imagen'
}

const formatFull = (value: string) =>
  formatPanelDate(value, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

const formatShort = (value: string) =>
  formatPanelDate(value, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })

/** Una fila del detalle. Etiqueta a la izquierda, dato a la derecha. */
const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className='flex justify-between gap-4 text-sm'>
    <span className='text-muted-foreground shrink-0'>{label}</span>
    <span className='min-w-0 text-right'>{children}</span>
  </div>
)

/**
 * El historial: qué salió, cuándo y con qué.
 *
 * Guarda dos cosas que la agenda no puede mostrar en una línea. Una es el
 * detalle —sobre todo el texto exacto que se publicó, que con `message` vacío no
 * existe en ningún lado hasta que se entrega—. La otra es el borrado, que acá es
 * de verdad y no un `canceled`: un envío ya publicado no se puede "bajar de la
 * agenda", así que o queda para siempre o se borra.
 */
const PublishedShares = ({ shares }: { shares: PublishedShare[] }) => {
  const [expanded, setExpanded] = useState(false)
  const [detail, setDetail] = useState<PublishedShare | null>(null)
  const [confirming, setConfirming] = useState<PublishedShare | null>(null)
  const [isPending, startTransition] = useTransition()

  const visible = expanded ? shares : shares.slice(0, PREVIEW)

  const remove = (share: PublishedShare) =>
    startTransition(async () => {
      const { error } = await deleteShare(share.id)

      if (error) {
        toast.error(error)

        return
      }

      toast.success('Borrado del historial')
      setConfirming(null)
      // El detalle puede estar abierto sobre la fila que se acaba de ir.
      setDetail(current => (current?.id === share.id ? null : current))
    })

  return (
    <>
      <ul className='divide-border border-border divide-y rounded-lg border'>
        {visible.map(share => (
          <li key={share.id} className='flex items-center gap-3 p-3'>
            <CoverThumb url={share.coverUrl} />

            {/* La fila entera sigue abriendo el detalle: es lo que se hace el
                99% de las veces y no vale hacerlo pasar por el menú. */}
            <button
              type='button'
              onClick={() => setDetail(share)}
              className='hover:text-accent-foreground min-w-0 flex-1 text-left'
            >
              <p className='truncate text-sm' title={share.title}>
                {share.title}
              </p>
              <p className='text-muted-foreground text-xs'>
                {formatShort(share.deliveredAt ?? share.scheduledAt)} · {MEDIA_LABEL[share.media].toLowerCase()}
                {share.warning && <span className='text-amber-600 dark:text-amber-500'> · con aviso</span>}
              </p>
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant='ghost'
                    size='icon'
                    className='shrink-0'
                    aria-label={`Acciones de «${share.title}»`}
                  />
                }
              >
                <MoreHorizontal className='size-4' />
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-56'>
                <DropdownMenuItem onClick={() => setDetail(share)}>
                  <ScrollText />
                  <span>Ver el texto que salió</span>
                </DropdownMenuItem>

                {share.postUrl && (
                  <DropdownMenuItem
                    render={<a href={share.postUrl} target='_blank' rel='noopener noreferrer' />}
                  >
                    <ExternalLink />
                    <span>Ver en LinkedIn</span>
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  variant='destructive'
                  disabled={isPending}
                  onClick={() => setConfirming(share)}
                >
                  <Trash2 />
                  <span>Borrar del historial</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </li>
        ))}
      </ul>

      {shares.length > PREVIEW && (
        <Button variant='ghost' size='sm' className='self-start' onClick={() => setExpanded(!expanded)}>
          {expanded ? 'Ver menos' : `Ver los ${shares.length - PREVIEW} anteriores`}
        </Button>
      )}

      <Dialog open={detail !== null} onOpenChange={open => !open && setDetail(null)}>
        <DialogContent className='sm:max-w-lg'>
          {detail && (
            <>
              <DialogHeader>
                <DialogTitle className='truncate'>{detail.title}</DialogTitle>
                {/* «En Buffer» es entregado pero todavía no publicado, así que
                    `deliveredAt` ahí no es la fecha en que se ve en el feed:
                    decir «publicado el …» sería mentir por un par de días. */}
                <DialogDescription>
                  {!detail.deliveredAt
                    ? `${detail.label}, sin fecha de entrega registrada`
                    : detail.label === 'En Buffer'
                      ? `Entregado a Buffer el ${formatFull(detail.deliveredAt)}; sale en su turno`
                      : `Publicado el ${formatFull(detail.deliveredAt)}`}
                </DialogDescription>
              </DialogHeader>

              <div className='flex flex-col gap-4 py-4'>
                <div className='flex flex-col gap-2'>
                  <Row label='Turno agendado'>{formatFull(detail.scheduledAt)}</Row>
                  <Row label='Vía'>{detail.provider === 'linkedin' ? 'LinkedIn (directo)' : 'Buffer'}</Row>
                  <Row label='Media'>{MEDIA_LABEL[detail.media]}</Row>
                  <Row label='Link'>
                    {detail.media === 'article'
                      ? 'En la tarjeta'
                      : detail.linkInFirstComment
                        ? 'Primer comentario'
                        : 'En ningún lado'}
                  </Row>
                </div>

                <div className='flex flex-col gap-1.5'>
                  <p className='text-muted-foreground text-xs'>
                    {detail.textIsCustom
                      ? 'Texto escrito a mano al programar. Es exactamente el que se publicó.'
                      : 'Reconstruido: el texto automático se arma al entregar y no se guarda, así que esto es cómo se armaría hoy. Si el título o la bajada cambiaron después, lo publicado dice otra cosa.'}
                  </p>
                  <pre className='bg-muted max-h-64 overflow-auto rounded-md p-3 text-xs break-words whitespace-pre-wrap'>
                    {detail.text}
                  </pre>
                </div>

                {/* El posteo salió; esto es algo secundario que no. Va en ámbar
                    y no en rojo justamente para que no se lea como un fallo. */}
                {detail.warning && (
                  <p className='rounded-md border border-amber-600/30 bg-amber-600/10 p-3 text-xs text-amber-600 dark:text-amber-500'>
                    {detail.warning}
                  </p>
                )}
              </div>

              <DialogFooter>
                <DialogClose render={<Button variant='outline' />}>Cerrar</DialogClose>
                {detail.postUrl && (
                  <Button
                    render={
                      <a href={detail.postUrl} target='_blank' rel='noopener noreferrer' />
                    }
                  >
                    <ExternalLink className='size-4' /> Ver en LinkedIn
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={confirming !== null} onOpenChange={open => !open && setConfirming(null)}>
        <DialogContent>
          {confirming && (
            <>
              <DialogHeader>
                <DialogTitle>Borrar del historial</DialogTitle>
                {/* Lo importante no es que se borre la fila sino lo que NO se
                    borra: el posteo sigue en LinkedIn. Decirlo acá evita que
                    alguien use este botón creyendo que despublica. */}
                <DialogDescription>
                  El posteo sigue publicado en LinkedIn: esto sólo borra el registro de «
                  {confirming.title}» en el panel. Se pierde el aviso «ya salió el{' '}
                  {formatShort(confirming.deliveredAt ?? confirming.scheduledAt)}» que aparece junto al
                  artículo sin programar. No se puede deshacer.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose render={<Button variant='outline' />}>Cancelar</DialogClose>
                <Button variant='destructive' disabled={isPending} onClick={() => remove(confirming)}>
                  {isPending ? 'Borrando…' : 'Borrar'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

export default PublishedShares
