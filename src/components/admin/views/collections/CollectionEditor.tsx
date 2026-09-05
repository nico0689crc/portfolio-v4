'use client'

// React Imports
import { useActionState, useEffect, useState } from 'react'

// Third-party Imports
import { toast } from 'sonner'
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react'

// Component Imports
import { Button } from '@/components/admin/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/admin/ui/card'
import { Field, FieldDescription, FieldLabel } from '@/components/admin/ui/field'
import { Input } from '@/components/admin/ui/input'
import { Switch } from '@/components/admin/ui/switch'
import { Textarea } from '@/components/admin/ui/textarea'

// Lib Imports
import { saveCollection, type CollectionFormState } from '@/lib/admin/collection-actions'
import type { CollectionRow } from '@/lib/admin/collection-data'
import type { FieldDef } from '@/lib/admin/collections'

export type EditorDef = {
  slug: string
  base: FieldDef[]
  translated: FieldDef[]
  labelField: string
}

const LOCALES = ['es', 'en'] as const
const LOCALE_LABELS: Record<string, string> = { es: 'Español', en: 'Inglés' }

const inputType = (type: FieldDef['type']) =>
  type === 'number' ? 'number' : type === 'date' ? 'date' : type === 'url' ? 'url' : 'text'

const FieldInput = ({
  field,
  name,
  defaultValue
}: {
  field: FieldDef
  name: string
  defaultValue: unknown
}) => {
  if (field.type === 'boolean') {
    return (
      <Field orientation='horizontal'>
        <Switch id={name} name={name} defaultChecked={Boolean(defaultValue)} />
        <FieldLabel htmlFor={name}>{field.label}</FieldLabel>
      </Field>
    )
  }

  // Un array llega como lista de tags y se edita separado por comas: el orden
  // importa y un widget de chips lo reordena en cada edición.
  const value = Array.isArray(defaultValue) ? defaultValue.join(', ') : (defaultValue ?? '')

  return (
    <Field>
      <FieldLabel htmlFor={name}>{field.label}</FieldLabel>
      {field.type === 'textarea' ? (
        <Textarea id={name} name={name} defaultValue={String(value)} rows={3} />
      ) : (
        <Input id={name} name={name} type={inputType(field.type)} defaultValue={String(value)} />
      )}
      {field.help && <FieldDescription>{field.help}</FieldDescription>}
    </Field>
  )
}

const CollectionEditor = ({ def, initialRows }: { def: EditorDef; initialRows: CollectionRow[] }) => {
  const [rows, setRows] = useState(initialRows)
  const [deleted, setDeleted] = useState<string[]>([])

  const [state, formAction, isPending] = useActionState<CollectionFormState, FormData>(
    saveCollection.bind(null, def.slug),
    { error: null, saved: false }
  )

  useEffect(() => {
    if (state.saved) toast.success('Cambios guardados')
    if (state.error) toast.error(state.error)
  }, [state])

  const addRow = () => {
    // El id se genera en el cliente para que agregar y editar sean la misma
    // operación del lado del servidor: todo es un upsert, no un insert que
    // después habría que distinguir.
    const row: CollectionRow = {
      id: crypto.randomUUID(),
      base: Object.fromEntries(def.base.map(f => [f.name, f.type === 'boolean' ? false : ''])),
      translations: Object.fromEntries(
        LOCALES.map(locale => [locale, Object.fromEntries(def.translated.map(f => [f.name, '']))])
      )
    }

    setRows(current => [...current, row])
  }

  const removeRow = (id: string) => {
    setRows(current => current.filter(row => row.id !== id))
    // Sólo las filas que ya existían necesitan borrarse en la base; una recién
    // agregada y descartada nunca llegó a guardarse.
    if (initialRows.some(row => row.id === id)) setDeleted(current => [...current, id])
  }

  const move = (index: number, delta: number) => {
    setRows(current => {
      const next = [...current]
      const target = index + delta

      if (target < 0 || target >= next.length) return current
      ;[next[index], next[target]] = [next[target], next[index]]

      return next
    })
  }

  return (
    <form action={formAction} className='flex flex-col gap-4'>
      <input type='hidden' name='ids' value={JSON.stringify(rows.map(row => row.id))} />
      <input type='hidden' name='deleted' value={JSON.stringify(deleted)} />

      {rows.length === 0 && (
        <p className='text-muted-foreground rounded-lg border border-dashed p-8 text-center text-sm'>
          Todavía no hay nada acá. Agregá el primero.
        </p>
      )}

      {rows.map((row, index) => (
        <Card key={row.id}>
          <CardHeader className='flex flex-row items-center justify-between gap-4'>
            <CardTitle className='text-base'>
              {row.translations.es?.[def.labelField] || `Sin ${def.labelField}`}
            </CardTitle>
            <div className='flex items-center gap-1'>
              <Button
                type='button'
                variant='ghost'
                size='icon'
                aria-label='Subir'
                disabled={index === 0}
                onClick={() => move(index, -1)}
              >
                <ChevronUp className='size-4' />
              </Button>
              <Button
                type='button'
                variant='ghost'
                size='icon'
                aria-label='Bajar'
                disabled={index === rows.length - 1}
                onClick={() => move(index, 1)}
              >
                <ChevronDown className='size-4' />
              </Button>
              <Button
                type='button'
                variant='ghost'
                size='icon'
                aria-label='Eliminar'
                onClick={() => removeRow(row.id)}
              >
                <Trash2 className='text-destructive size-4' />
              </Button>
            </div>
          </CardHeader>
          <CardContent className='flex flex-col gap-6'>
            {def.base.length > 0 && (
              <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                {def.base.map(field => (
                  <FieldInput
                    key={field.name}
                    field={field}
                    name={`${row.id}.${field.name}`}
                    defaultValue={row.base[field.name]}
                  />
                ))}
              </div>
            )}

            <div className='grid gap-6 md:grid-cols-2'>
              {LOCALES.map(locale => (
                <div key={locale} className='flex flex-col gap-4'>
                  <h4 className='text-muted-foreground text-xs font-semibold uppercase tracking-widest'>
                    {LOCALE_LABELS[locale]}
                  </h4>
                  {def.translated.map(field => (
                    <FieldInput
                      key={field.name}
                      field={field}
                      name={`${row.id}.${locale}.${field.name}`}
                      defaultValue={row.translations[locale]?.[field.name]}
                    />
                  ))}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      <div className='flex items-center justify-between gap-3'>
        <Button type='button' variant='outline' onClick={addRow}>
          <Plus className='size-4' /> Agregar
        </Button>
        <Button type='submit' disabled={isPending}>
          {isPending ? 'Guardando…' : 'Guardar cambios'}
        </Button>
      </div>
    </form>
  )
}

export default CollectionEditor
