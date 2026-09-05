'use client'

// React Imports
import { useActionState, useEffect, useState } from 'react'

// Third-party Imports
import { toast } from 'sonner'
import { Plus, Trash2 } from 'lucide-react'

// Component Imports
import { Alert, AlertDescription } from '@/components/admin/ui/alert'
import { Button } from '@/components/admin/ui/button'
import { Field, FieldLabel } from '@/components/admin/ui/field'
import { Input } from '@/components/admin/ui/input'
import { Switch } from '@/components/admin/ui/switch'

// Lib Imports
import { saveRedirects, type RedirectsFormState } from '@/lib/admin/redirects-actions'

export type RedirectRow = {
  fromPath: string
  toPath: string
  permanent: boolean
}

const RedirectsEditor = ({ initialRows }: { initialRows: RedirectRow[] }) => {
  // La clave estable de cada fila no puede ser `from_path`, porque editarlo es
  // justamente lo que la identifica: React perdería el foco en cada tecla.
  const [rows, setRows] = useState(() =>
    initialRows.map(row => ({ key: row.fromPath, ...row }))
  )

  const [deleted, setDeleted] = useState<string[]>([])

  const [state, formAction, isPending] = useActionState<RedirectsFormState, FormData>(saveRedirects, {
    error: null,
    saved: false
  })

  useEffect(() => {
    if (state.saved) toast.success('Redirecciones guardadas')
    if (state.error) toast.error(state.error)
  }, [state])

  const addRow = () =>
    setRows(current => [...current, { key: crypto.randomUUID(), fromPath: '', toPath: '', permanent: true }])

  const removeRow = (key: string) => {
    setRows(current => current.filter(row => row.key !== key))
    if (initialRows.some(row => row.fromPath === key)) setDeleted(current => [...current, key])
  }

  return (
    <form action={formAction} className='flex flex-col gap-4'>
      <input type='hidden' name='keys' value={JSON.stringify(rows.map(row => row.key))} />
      <input type='hidden' name='deleted' value={JSON.stringify(deleted)} />

      <Alert>
        <AlertDescription>
          Se aplican en el próximo build. Las redirecciones por slug renombrado son automáticas y no hacen
          falta acá.
        </AlertDescription>
      </Alert>

      {rows.length === 0 && (
        <p className='text-muted-foreground rounded-lg border border-dashed p-8 text-center text-sm'>
          No hay redirecciones propias.
        </p>
      )}

      {rows.map(row => (
        <div key={row.key} className='border-border grid items-end gap-4 rounded-lg border p-4 sm:grid-cols-[1fr_1fr_auto_auto]'>
          <Field>
            <FieldLabel htmlFor={`${row.key}.from_path`}>Desde</FieldLabel>
            <Input
              id={`${row.key}.from_path`}
              name={`${row.key}.from_path`}
              defaultValue={row.fromPath}
              placeholder='/vieja-url'
            />
          </Field>
          <Field>
            <FieldLabel htmlFor={`${row.key}.to_path`}>Hacia</FieldLabel>
            <Input
              id={`${row.key}.to_path`}
              name={`${row.key}.to_path`}
              defaultValue={row.toPath}
              placeholder='/nueva-url'
            />
          </Field>
          <Field orientation='horizontal'>
            <Switch id={`${row.key}.permanent`} name={`${row.key}.permanent`} defaultChecked={row.permanent} />
            <FieldLabel htmlFor={`${row.key}.permanent`}>Permanente</FieldLabel>
          </Field>
          <Button type='button' variant='ghost' size='icon' aria-label='Eliminar' onClick={() => removeRow(row.key)}>
            <Trash2 className='text-destructive size-4' />
          </Button>
        </div>
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

export default RedirectsEditor
