'use client'

// React Imports
import { useActionState, useEffect } from 'react'

// Third-party Imports
import { toast } from 'sonner'
import { Plus } from 'lucide-react'

// Component Imports
import { Button } from '@/components/admin/ui/button'
import { Field, FieldDescription, FieldLabel } from '@/components/admin/ui/field'
import { Input } from '@/components/admin/ui/input'

// Lib Imports
import { createPost, type PostFormState } from '@/lib/admin/posts-actions'

const NewPostForm = () => {
  const [state, formAction, isPending] = useActionState<PostFormState, FormData>(createPost, {
    error: null,
    saved: false
  })

  useEffect(() => {
    if (state.error) toast.error(state.error)
  }, [state])

  return (
    <form action={formAction} className='flex flex-wrap items-end gap-3'>
      <Field className='flex-1'>
        <FieldLabel htmlFor='key'>Clave del post</FieldLabel>
        <Input id='key' name='key' placeholder='mi-primer-post' />
        <FieldDescription>
          Identificador estable, no es la URL. Los slugs se editan por idioma después.
        </FieldDescription>
      </Field>
      <Button type='submit' disabled={isPending}>
        <Plus className='size-4' /> {isPending ? 'Creando…' : 'Crear'}
      </Button>
    </form>
  )
}

export default NewPostForm
