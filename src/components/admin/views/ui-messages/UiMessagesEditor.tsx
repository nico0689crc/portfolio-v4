'use client'

// React Imports
import { useActionState, useEffect, useMemo, useState } from 'react'

// Third-party Imports
import { toast } from 'sonner'

// Component Imports
import { Badge } from '@/components/admin/ui/badge'
import { Button } from '@/components/admin/ui/button'
import { Input } from '@/components/admin/ui/input'
import { Textarea } from '@/components/admin/ui/textarea'

// Lib Imports
import { saveUiMessages, type UiMessagesFormState } from '@/lib/admin/messages-actions'

export type UiMessage = {
  key: string
  namespace: string
  notes: string | null
  allowsHtml: boolean
  values: Record<string, string>
}

const LOCALES = ['es', 'en'] as const

/** Un texto largo se edita mejor en varias líneas que en un input de una. */
const LONG_TEXT = 90

const UiMessagesEditor = ({ messages }: { messages: UiMessage[] }) => {
  const [namespace, setNamespace] = useState('all')
  const [query, setQuery] = useState('')

  const namespaces = useMemo(
    () => ['all', ...Array.from(new Set(messages.map(message => message.namespace))).sort()],
    [messages]
  )

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()

    return messages.filter(message => {
      if (namespace !== 'all' && message.namespace !== namespace) return false
      if (!needle) return true

      return (
        message.key.toLowerCase().includes(needle) ||
        LOCALES.some(locale => (message.values[locale] ?? '').toLowerCase().includes(needle))
      )
    })
  }, [messages, namespace, query])

  // Se envían siempre todas las claves, no sólo las visibles: filtrar es una
  // ayuda para leer, y un guardado que sólo escribiera lo filtrado borraría en
  // silencio lo que quedó fuera del filtro.
  const [state, formAction, isPending] = useActionState<UiMessagesFormState, FormData>(
    saveUiMessages.bind(
      null,
      messages.map(message => message.key)
    ),
    { error: null, saved: false }
  )

  useEffect(() => {
    if (state.saved) toast.success('Textos guardados')
    if (state.error) toast.error(state.error)
  }, [state])

  return (
    <form action={formAction} className='flex flex-col gap-4'>
      <div className='flex flex-wrap items-center gap-3'>
        <Input
          placeholder='Buscar por clave o texto…'
          value={query}
          onChange={event => setQuery(event.target.value)}
          className='max-w-xs'
        />
        <div className='flex flex-wrap gap-1'>
          {namespaces.map(name => (
            <Button
              key={name}
              type='button'
              size='sm'
              variant={namespace === name ? 'default' : 'outline'}
              onClick={() => setNamespace(name)}
            >
              {name === 'all' ? 'Todos' : name}
            </Button>
          ))}
        </div>
        <span className='text-muted-foreground ml-auto text-sm'>
          {visible.length} de {messages.length}
        </span>
      </div>

      <div className='flex flex-col gap-3'>
        {messages.map(message => {
          const isVisible = visible.includes(message)
          const isLong = LOCALES.some(locale => (message.values[locale] ?? '').length > LONG_TEXT)

          return (
            // Las filas ocultas siguen montadas para que sus inputs viajen en el
            // envío; desmontarlas las sacaría del FormData.
            <div
              key={message.key}
              hidden={!isVisible}
              className='border-border grid gap-3 rounded-lg border p-3 md:grid-cols-[minmax(0,1fr)_1fr_1fr]'
            >
              <div className='flex flex-col gap-1'>
                <code className='text-xs break-all'>{message.key}</code>
                <div className='flex flex-wrap gap-1'>
                  <Badge variant='outline' className='text-[10px]'>
                    {message.namespace}
                  </Badge>
                  {message.allowsHtml && (
                    <Badge variant='secondary' className='text-[10px]'>
                      HTML
                    </Badge>
                  )}
                </div>
                {message.notes && <p className='text-muted-foreground text-xs'>{message.notes}</p>}
              </div>

              {LOCALES.map(locale =>
                isLong ? (
                  <Textarea
                    key={locale}
                    name={`${message.key}.${locale}`}
                    defaultValue={message.values[locale] ?? ''}
                    rows={3}
                    aria-label={`${message.key} ${locale}`}
                  />
                ) : (
                  <Input
                    key={locale}
                    name={`${message.key}.${locale}`}
                    defaultValue={message.values[locale] ?? ''}
                    aria-label={`${message.key} ${locale}`}
                  />
                )
              )}
            </div>
          )
        })}
      </div>

      <div className='flex justify-end'>
        <Button type='submit' disabled={isPending}>
          {isPending ? 'Guardando…' : 'Guardar cambios'}
        </Button>
      </div>
    </form>
  )
}

export default UiMessagesEditor
