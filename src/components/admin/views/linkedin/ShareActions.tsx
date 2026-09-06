'use client'

// React Imports
import { useTransition } from 'react'

// Third-party Imports
import { toast } from 'sonner'
import { RotateCcw, X } from 'lucide-react'

// Component Imports
import { Button } from '@/components/admin/ui/button'
import ScheduleDialog from './ScheduleDialog'

// Lib Imports
import { cancelShare, retryShare } from '@/lib/admin/social-actions'

/**
 * Lo que se puede hacer con un envío según en qué estado esté.
 *
 * Un envío ya entregado a Buffer no muestra ninguna acción: editarlo acá no
 * cambiaría lo que Buffer tiene agendado, y un botón que miente es peor que no
 * tener botón. Para eso se entra a Buffer.
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
  media: 'auto' | 'document' | 'none'
  linkInFirstComment: boolean
  currentDocument: string | null
  hasCover: boolean
}) => {
  const [isPending, startTransition] = useTransition()

  if (status !== 'scheduled' && status !== 'failed' && status !== 'sending') return null

  const run = (action: () => Promise<{ error: string | null }>, ok: string) =>
    startTransition(async () => {
      const { error } = await action()

      if (error) toast.error(error)
      else toast.success(ok)
    })

  return (
    <div className='flex items-center gap-1'>
      {status !== 'sending' && (
        <ScheduleDialog
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
          triggerLabel='Editar'
          triggerVariant='ghost'
        />
      )}

      {/* `sending` es una entrega que quedó a mitad de camino: se destraba
          volviéndola a la agenda, no editándola. */}
      {(status === 'failed' || status === 'sending') && (
        <Button
          variant='ghost'
          size='sm'
          disabled={isPending}
          onClick={() => run(() => retryShare(shareId), 'Vuelve a la agenda')}
        >
          <RotateCcw className='size-4' /> Reintentar
        </Button>
      )}

      {status !== 'sending' && (
        <Button
          variant='ghost'
          size='icon'
          aria-label='Cancelar envío'
          disabled={isPending}
          onClick={() => run(() => cancelShare(shareId), 'Envío cancelado')}
        >
          <X className='size-4' />
        </Button>
      )}
    </div>
  )
}

export default ShareActions
