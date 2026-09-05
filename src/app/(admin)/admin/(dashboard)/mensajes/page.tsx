// Component Imports
import MessageRow, { type InboxMessage } from '@/components/admin/views/inbox/MessageRow'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/admin/ui/table'

// Lib Imports
import { createSupabaseServerClient } from '@/lib/supabase/server'

export const metadata = { title: 'Mensajes' }

const AdminInboxPage = async () => {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from('contact_messages')
    .select('id, name, email, message, locale, status, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    return <p className='text-destructive text-sm'>No se pudieron cargar los mensajes: {error.message}</p>
  }

  const messages: InboxMessage[] = data.map(row => ({
    id: row.id,
    name: row.name,
    email: row.email,
    message: row.message,
    locale: row.locale,
    status: row.status,
    createdAt: row.created_at
  }))

  const unread = messages.filter(message => message.status === 'new').length

  return (
    <div className='flex flex-col gap-6'>
      <div>
        <h1 className='text-2xl font-semibold tracking-tight'>Mensajes</h1>
        <p className='text-muted-foreground text-sm'>
          {messages.length === 0
            ? 'Todavía no llegó ninguno.'
            : `${messages.length} en total, ${unread} sin leer.`}
        </p>
      </div>

      {messages.length > 0 && (
        <div className='border-border rounded-lg border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>De</TableHead>
                <TableHead>Mensaje</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className='w-0' />
              </TableRow>
            </TableHeader>
            <TableBody>
              {messages.map(message => (
                <MessageRow key={message.id} message={message} />
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

export default AdminInboxPage
