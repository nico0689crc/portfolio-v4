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
import { Switch } from '@/components/admin/ui/switch'
import { Textarea } from '@/components/admin/ui/textarea'

// Lib Imports
import { updatePageSeo, type SeoFormState } from '@/lib/admin/seo-actions'

export type SeoRoute = {
  routeKey: string
  translations: Record<string, { title: string; description: string; ogImage: string; noindex: boolean }>
}

const LOCALES = ['es', 'en'] as const
const LOCALE_LABELS: Record<string, string> = { es: 'Español', en: 'Inglés' }

const SeoEditor = ({ routes }: { routes: SeoRoute[] }) => {
  const [state, formAction, isPending] = useActionState<SeoFormState, FormData>(
    updatePageSeo.bind(
      null,
      routes.map(route => route.routeKey)
    ),
    { error: null, saved: false }
  )

  useEffect(() => {
    if (state.saved) toast.success('SEO guardado')
    if (state.error) toast.error(state.error)
  }, [state])

  return (
    <form action={formAction} className='flex flex-col gap-4'>
      {routes.map(route => (
        <Card key={route.routeKey}>
          <CardHeader>
            <CardTitle className='font-mono text-base'>{route.routeKey}</CardTitle>
          </CardHeader>
          <CardContent className='grid gap-6 md:grid-cols-2'>
            {LOCALES.map(locale => {
              const values = route.translations[locale]
              const prefix = `${route.routeKey}.${locale}`

              return (
                <div key={locale} className='flex flex-col gap-4'>
                  <h4 className='text-muted-foreground text-xs font-semibold tracking-widest uppercase'>
                    {LOCALE_LABELS[locale]}
                  </h4>

                  <Field>
                    <FieldLabel htmlFor={`${prefix}.title`}>Título</FieldLabel>
                    <Input id={`${prefix}.title`} name={`${prefix}.title`} defaultValue={values?.title ?? ''} />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor={`${prefix}.description`}>Descripción</FieldLabel>
                    <Textarea
                      id={`${prefix}.description`}
                      name={`${prefix}.description`}
                      rows={3}
                      defaultValue={values?.description ?? ''}
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor={`${prefix}.og_image`}>Imagen OG</FieldLabel>
                    <Input
                      id={`${prefix}.og_image`}
                      name={`${prefix}.og_image`}
                      defaultValue={values?.ogImage ?? ''}
                      placeholder='/og/default.png'
                    />
                    <FieldDescription>Ruta dentro del sitio.</FieldDescription>
                  </Field>

                  <Field orientation='horizontal'>
                    <Switch
                      id={`${prefix}.noindex`}
                      name={`${prefix}.noindex`}
                      defaultChecked={values?.noindex ?? false}
                    />
                    <FieldLabel htmlFor={`${prefix}.noindex`}>No indexar</FieldLabel>
                  </Field>
                </div>
              )
            })}
          </CardContent>
        </Card>
      ))}

      <div className='flex justify-end'>
        <Button type='submit' disabled={isPending}>
          {isPending ? 'Guardando…' : 'Guardar cambios'}
        </Button>
      </div>
    </form>
  )
}

export default SeoEditor
