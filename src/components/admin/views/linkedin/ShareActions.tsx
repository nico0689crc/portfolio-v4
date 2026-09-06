'use client'

// React Imports
import { useState, useTransition } from 'react'

// Third-party Imports
import { toast } from 'sonner'
import { MoreHorizontal, Pencil, RotateCcw, Send, X } from 'lucide-react'

// Component Imports
import { Button } from '@/components/admin/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/admin/ui/dropdown-menu'
import ScheduleDialog from './ScheduleDialog'

// Lib Imports
import { cancelShare, publishNow, retryShare } from '@/lib/admin/social-actions'

/**
 * Lo que se puede hacer con un envío según en qué estado esté.
 *
 * Un envío ya entregado a Buffer no muestra ninguna acción: editarlo acá no
 * cambiaría lo que Buffer tiene agendado, y un botón que miente es peor que no
 * tener botón. Para eso se entra a Buffer.
 *
 * Va todo en un menú y no en una fila de botones para que la agenda tenga la
 * misma anatomía que la lista de al lado —miniatura, texto, un solo disparador—
 * y para que «Publicar ahora» y «Cancelar» dejen de estar a un clic distraído
 * de distancia: los dos son irreversibles.
 */
const ShareActions = ({
  shareId,
  postId,
  title,
  status,
  scheduledAtLocal,
  message,
  autoMessage,
  media,
  linkInFirstComment,
  currentDocument,
  hasCover
}: {
  shareId: string
  postId: string
  title: string
  status: string
  scheduledAtLocal: string
  message: string
  autoMessage: string
  media: 'auto' | 'article' | 'document' | 'none'
  linkInFirstComment: boolean
  currentDocument: string | null
  hasCover: boolean
}) => {
  const [isPending, startTransition] = useTransition()

  // El diálogo lo abre el menú, que se cierra al hacer clic, así que la
  // apertura se maneja acá y no adentro de `ScheduleDialog`.
  const [editing, setEditing] = useState(false)

  if (status !== 'scheduled' && status !== 'failed' && status !== 'sending') return null

  const run = (action: () => Promise<{ error: string | null }>, ok: string) =>
    startTransition(async () => {
      const { error } = await action()

      if (error) toast.error(error)
      else toast.success(ok)
    })

  /**
   * Publicar salteando la agenda.
   *
   * El aviso se muestra aparte del éxito porque son cosas distintas: el posteo
   * salió, y además algo secundario —el primer comentario, casi siempre— no
   * pudo hacerse. Meterlo en un `toast.error` haría pensar que no se publicó.
   */
  const publish = () =>
    startTransition(async () => {
      const { error, warning } = await publishNow(shareId)

      if (error) {
        toast.error(error)

        return
      }

      toast.success('Publicado')

      if (warning) toast.warning(warning)
    })

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant='ghost'
              size='icon'
              className='shrink-0'
              aria-label={`Acciones de «${title}»`}
            />
          }
        >
          <MoreHorizontal className='size-4' />
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-56'>
          {status !== 'sending' && (
            <DropdownMenuItem disabled={isPending} onClick={publish}>
              <Send />
              <span>{isPending ? 'Publicando…' : 'Publicar ahora'}</span>
            </DropdownMenuItem>
          )}

          {status !== 'sending' && (
            <DropdownMenuItem onClick={() => setEditing(true)}>
              <Pencil />
              <span>Editar envío</span>
            </DropdownMenuItem>
          )}

          {/* `sending` es una entrega que quedó a mitad de camino: se destraba
              volviéndola a la agenda, no editándola. */}
          {(status === 'failed' || status === 'sending') && (
            <DropdownMenuItem
              disabled={isPending}
              onClick={() => run(() => retryShare(shareId), 'Vuelve a la agenda')}
            >
              <RotateCcw />
              <span>Reintentar</span>
            </DropdownMenuItem>
          )}

          {status !== 'sending' && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant='destructive'
                disabled={isPending}
                onClick={() => run(() => cancelShare(shareId), 'Envío cancelado')}
              >
                <X />
                <span>Cancelar envío</span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {editing && (
        <ScheduleDialog
          open
          onOpenChange={() => setEditing(false)}
          shareId={shareId}
          postId={postId}
          title={title}
          defaultScheduledAt={scheduledAtLocal}
          defaultMessage={message}
          autoMessage={autoMessage}
          defaultMedia={media}
          defaultLinkInFirstComment={linkInFirstComment}
          currentDocument={currentDocument}
          hasCover={hasCover}
        />
      )}
    </>
  )
}

export default ShareActions
