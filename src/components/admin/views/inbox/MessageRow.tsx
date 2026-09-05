'use client'

// React Imports
import { useTransition } from 'react'

// Third-party Imports
import { toast } from 'sonner'

// Component Imports
import { Badge } from '@/components/admin/ui/badge'
import { Button } from '@/components/admin/ui/button'
import { TableCell, TableRow } from '@/components/admin/ui/table'

// Lib Imports
import { setMessageStatus, type MessageStatus } from '@/lib/admin/inbox-actions'

export type InboxMessage = {
  id: string
  name: string
  email: string
  message: string
  /** El formulario público lo manda, pero la columna acepta null. */
  locale: string | null
  status: MessageStatus
  createdAt: string
}

const STATUS_LABELS: Record<MessageStatus, string> = {
  new: 'Nuevo',
  read: 'Leído',
  replied: 'Respondido',
  spam: 'Spam'
}

const NEXT_ACTIONS: { status: MessageStatus; label: string }[] = [
  { status: 'read', label: 'Leído' },
  { status: 'replied', label: 'Respondido' },
  { status: 'spam', label: 'Spam' }
]

const MessageRow = ({ message }: { message: InboxMessage }) => {
  const [isPending, startTransition] = useTransition()

  const update = (status: MessageStatus) =>
    startTransition(async () => {
      const { error } = await setMessageStatus(message.id, status)

      if (error) toast.error(error)
      else toast.success(`Marcado como ${STATUS_LABELS[status].toLowerCase()}`)
    })

  return (
    <TableRow className={message.status === 'new' ? 'font-medium' : undefined}>
      <TableCell className='align-top'>
        {message.name}
        <a href={`mailto:${message.email}`} className='text-muted-foreground block text-xs font-normal hover:underline'>
          {message.email}
        </a>
      </TableCell>
      <TableCell className='text-muted-foreground max-w-md align-top text-sm font-normal whitespace-pre-wrap'>
        {message.message}
      </TableCell>
      <TableCell className='align-top'>
        <Badge variant={message.status === 'new' ? 'default' : 'secondary'}>
          {STATUS_LABELS[message.status]}
        </Badge>
      </TableCell>
      <TableCell className='text-muted-foreground align-top text-xs font-normal whitespace-nowrap'>
        {new Date(message.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
        {message.locale && <span className='block uppercase'>{message.locale}</span>}
      </TableCell>
      <TableCell className='align-top'>
        <div className='flex gap-1'>
          {NEXT_ACTIONS.filter(action => action.status !== message.status).map(action => (
            <Button
              key={action.status}
              type='button'
              variant='outline'
              size='sm'
              disabled={isPending}
              onClick={() => update(action.status)}
            >
              {action.label}
            </Button>
          ))}
        </div>
      </TableCell>
    </TableRow>
  )
}

export default MessageRow
