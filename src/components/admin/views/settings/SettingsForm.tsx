'use client'

// React Imports
import { useActionState, useEffect } from 'react'

// Third-party Imports
import { toast } from 'sonner'

// Component Imports
import { Button } from '@/components/admin/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/admin/ui/card'
import { Field, FieldDescription, FieldLabel } from '@/components/admin/ui/field'
import { Input } from '@/components/admin/ui/input'
import { Textarea } from '@/components/admin/ui/textarea'

// Lib Imports
import { updateSettings, type SettingsFormState } from '@/lib/admin/settings-actions'

export type SettingsValues = {
  contactEmail: string
  yearsOfExperience: number
  socialLinks: string[]
  cvFiles: { es: string; en: string }
}

const SettingsForm = ({ values }: { values: SettingsValues }) => {
  const [state, formAction, isPending] = useActionState<SettingsFormState, FormData>(updateSettings, {
    error: null,
    saved: false
  })

  useEffect(() => {
    if (state.saved) toast.success('Ajustes guardados')
    if (state.error) toast.error(state.error)
  }, [state])

  return (
    <form action={formAction} className='flex flex-col gap-6'>
      <Card>
        <CardHeader>
          <CardTitle>Contacto</CardTitle>
        </CardHeader>
        <CardContent className='grid gap-4 sm:grid-cols-2'>
          <Field>
            <FieldLabel htmlFor='contact_email'>Email de contacto</FieldLabel>
            <Input id='contact_email' name='contact_email' type='email' defaultValue={values.contactEmail} />
            <FieldDescription>Adónde llegan los mensajes del formulario público.</FieldDescription>
          </Field>

          <Field>
            <FieldLabel htmlFor='years_of_experience'>Años de experiencia</FieldLabel>
            <Input
              id='years_of_experience'
              name='years_of_experience'
              type='number'
              defaultValue={values.yearsOfExperience}
            />
            <FieldDescription>Se muestra en la home y en el CV.</FieldDescription>
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Redes</CardTitle>
        </CardHeader>
        <CardContent>
          <Field>
            <FieldLabel htmlFor='social_links'>Enlaces</FieldLabel>
            {/* Una URL por línea en vez de separadas por coma: las URLs llevan
                comas y partir por coma rompería la mitad de ellas. */}
            <Textarea
              id='social_links'
              name='social_links'
              rows={5}
              defaultValue={values.socialLinks.join('\n')}
            />
            <FieldDescription>Una URL por línea. Alimentan el sameAs del structured data.</FieldDescription>
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Archivos de CV</CardTitle>
        </CardHeader>
        <CardContent className='grid gap-4 sm:grid-cols-2'>
          <Field>
            <FieldLabel htmlFor='cv_files.es'>PDF en español</FieldLabel>
            <Input id='cv_files.es' name='cv_files.es' defaultValue={values.cvFiles.es} />
          </Field>
          <Field>
            <FieldLabel htmlFor='cv_files.en'>PDF en inglés</FieldLabel>
            <Input id='cv_files.en' name='cv_files.en' defaultValue={values.cvFiles.en} />
          </Field>
          <FieldDescription className='sm:col-span-2'>
            Rutas dentro del sitio, empezando con «/». Se listan en el sitemap como documentos indexables.
          </FieldDescription>
        </CardContent>
      </Card>

      <div className='flex justify-end'>
        <Button type='submit' disabled={isPending}>
          {isPending ? 'Guardando…' : 'Guardar cambios'}
        </Button>
      </div>
    </form>
  )
}

export default SettingsForm
