'use client'

// React Imports
import { useActionState, useEffect, useState } from 'react'

// Third-party Imports
import { toast } from 'sonner'
import { Plus } from 'lucide-react'

// Component Imports
import { Button } from '@/components/admin/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/admin/ui/card'
import { Field, FieldDescription, FieldLabel } from '@/components/admin/ui/field'
import { Input } from '@/components/admin/ui/input'

// Lib Imports
import { createPost, type PostFormState } from '@/lib/admin/posts-actions'
import { slugify } from '@/lib/slug'

const NewPostForm = () => {
  const [titleEs, setTitleEs] = useState('')
  const [titleEn, setTitleEn] = useState('')

  const [state, formAction, isPending] = useActionState<PostFormState, FormData>(createPost, {
    error: null,
    saved: false
  })

  useEffect(() => {
    if (state.error) toast.error(state.error)
  }, [state])

  // Se calcula con el mismo `slugify` que usa el servidor, así lo que se
  // previsualiza es exactamente lo que se va a guardar.
  const slugEs = slugify(titleEs)
  const slugEn = slugify(titleEn)

  return (
    <form action={formAction} className='flex flex-col gap-6'>
      <Card>
        <CardHeader>
          <CardTitle>Título</CardTitle>
        </CardHeader>
        <CardContent className='flex flex-col gap-4'>
          <Field>
            <FieldLabel htmlFor='es.title'>Español</FieldLabel>
            <Input
              id='es.title'
              name='es.title'
              value={titleEs}
              onChange={event => setTitleEs(event.target.value)}
              placeholder='De chef a desarrollador'
              autoFocus
            />
            <FieldDescription>
              {slugEs ? `URL: /blog/${slugEs}` : 'La URL se genera a partir del título.'}
            </FieldDescription>
          </Field>

          <Field>
            <FieldLabel htmlFor='en.title'>Inglés</FieldLabel>
            <Input
              id='en.title'
              name='en.title'
              value={titleEn}
              onChange={event => setTitleEn(event.target.value)}
              placeholder='From chef to developer'
            />
            <FieldDescription>
              {slugEn
                ? `URL: /blog/${slugEn}`
                : 'Opcional. Podés dejarlo vacío y traducirlo después.'}
            </FieldDescription>
          </Field>
        </CardContent>
      </Card>

      <div className='flex items-center justify-between gap-4'>
        <p className='text-muted-foreground text-sm'>
          Nace como borrador. El cuerpo, la bajada y el SEO se escriben en el editor.
        </p>
        <Button type='submit' disabled={isPending || !titleEs.trim()}>
          <Plus className='size-4' /> {isPending ? 'Creando…' : 'Crear y editar'}
        </Button>
      </div>
    </form>
  )
}

export default NewPostForm
