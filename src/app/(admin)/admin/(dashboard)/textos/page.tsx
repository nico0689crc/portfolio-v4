// Component Imports
import UiMessagesEditor, { type UiMessage } from '@/components/admin/views/ui-messages/UiMessagesEditor'
import { Badge } from '@/components/admin/ui/badge'

// Lib Imports
import { createSupabaseServerClient } from '@/lib/supabase/server'

export const metadata = { title: 'Textos de UI' }

const AdminUiMessagesPage = async () => {
  const supabase = await createSupabaseServerClient()

  const [{ data: keys }, { data: values }, { data: coverage }] = await Promise.all([
    supabase.from('ui_message_keys').select('key, namespace, notes, allows_html').order('sort_order'),
    supabase.from('ui_messages').select('key, locale, value'),
    supabase.from('ui_message_coverage').select('locale, namespace, missing_keys')
  ])

  const byKey = new Map<string, Record<string, string>>()

  for (const row of values ?? []) {
    if (!byKey.has(row.key)) byKey.set(row.key, {})
    byKey.get(row.key)![row.locale] = row.value
  }

  const messages: UiMessage[] = (keys ?? []).map(row => ({
    key: row.key,
    namespace: row.namespace,
    notes: row.notes,
    allowsHtml: row.allows_html,
    values: byKey.get(row.key) ?? {}
  }))

  const missing = (coverage ?? []).filter(row => (row.missing_keys ?? 0) > 0)

  return (
    <div className='flex flex-col gap-6'>
      <div>
        <h1 className='text-2xl font-semibold tracking-tight'>Textos de UI</h1>
        <p className='text-muted-foreground text-sm'>
          Todo el texto de la interfaz pública. Las etiquetas del panel no salen de acá.
        </p>
      </div>

      {/* La vista de cobertura es lo único que avisa de un idioma a medias: un
          texto faltante no rompe nada, cae al idioma por defecto y pasa
          desapercibido hasta que alguien lo ve en producción. */}
      {missing.length > 0 && (
        <div className='flex flex-wrap items-center gap-2'>
          <span className='text-sm font-medium'>Sin traducir:</span>
          {missing.map(row => (
            <Badge key={`${row.locale}-${row.namespace}`} variant='destructive'>
              {row.namespace} · {row.locale} · {row.missing_keys}
            </Badge>
          ))}
        </div>
      )}

      <UiMessagesEditor messages={messages} />
    </div>
  )
}

export default AdminUiMessagesPage
