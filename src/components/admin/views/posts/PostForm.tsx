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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/admin/ui/select'
import { Switch } from '@/components/admin/ui/switch'
import { Textarea } from '@/components/admin/ui/textarea'

// Lib Imports
import { updatePost, type PostFormState } from '@/lib/admin/posts-actions'

export type PostTranslationValues = {
  slug: string
  title: string
  excerpt: string
  body: string
  status: string
  publishedAt: string
  noindex: boolean
  readingMinutes: number | null
  wordCount: number | null
}

export type PostFormValues = {
  key: string
  translations: Record<string, PostTranslationValues>
}

const LOCALES = ['es', 'en'] as const
const LOCALE_LABELS: Record<string, string> = { es: 'Español', en: 'Inglés' }

const STATUSES = [
  { value: 'draft', label: 'Borrador' },
  { value: 'published', label: 'Publicado' }
]

const PostForm = ({ post }: { post: PostFormValues }) => {
  const [state, formAction, isPending] = useActionState<PostFormState, FormData>(
    updatePost.bind(null, post.key),
    { error: null, saved: false }
  )

  useEffect(() => {
    if (state.saved) toast.success('Post guardado')
    if (state.error) toast.error(state.error)
  }, [state])

  return (
    <form action={formAction} className='flex flex-col gap-6'>
      {LOCALES.map(locale => {
        const values = post.translations[locale]

        return (
          <Card key={locale}>
            <CardHeader>
              <CardTitle>{LOCALE_LABELS[locale]}</CardTitle>
            </CardHeader>
            <CardContent className='flex flex-col gap-4'>
              <div className='grid gap-4 sm:grid-cols-2'>
                <Field>
                  <FieldLabel htmlFor={`${locale}.title`}>Título</FieldLabel>
                  <Input id={`${locale}.title`} name={`${locale}.title`} defaultValue={values?.title ?? ''} />
                </Field>

                <Field>
                  <FieldLabel htmlFor={`${locale}.slug`}>Slug</FieldLabel>
                  <Input id={`${locale}.slug`} name={`${locale}.slug`} defaultValue={values?.slug ?? ''} />
                </Field>

                <Field>
                  <FieldLabel htmlFor={`${locale}.status`}>Estado</FieldLabel>
                  {/* Por idioma, no por post: la traducción puede seguir siendo
                      borrador mientras el original ya está publicado. */}
                  <Select
                    name={`${locale}.status`}
                    defaultValue={values?.status ?? 'draft'}
                    items={STATUSES}
                  >
                    <SelectTrigger id={`${locale}.status`} className='w-full'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map(status => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field>
                  <FieldLabel htmlFor={`${locale}.published_at`}>Publicado el</FieldLabel>
                  <Input
                    id={`${locale}.published_at`}
                    name={`${locale}.published_at`}
                    type='date'
                    defaultValue={values?.publishedAt ?? ''}
                  />
                  <FieldDescription>Si lo dejás vacío y publicás, se usa hoy.</FieldDescription>
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor={`${locale}.excerpt`}>Bajada</FieldLabel>
                <Textarea
                  id={`${locale}.excerpt`}
                  name={`${locale}.excerpt`}
                  rows={2}
                  defaultValue={values?.excerpt ?? ''}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor={`${locale}.body`}>Cuerpo</FieldLabel>
                <Textarea
                  id={`${locale}.body`}
                  name={`${locale}.body`}
                  rows={16}
                  defaultValue={values?.body ?? ''}
                  className='font-mono text-sm'
                />
                <FieldDescription>
                  {values?.wordCount
                    ? `${values.wordCount} palabras · ${values.readingMinutes} min de lectura. Se recalcula al guardar.`
                    : 'Las palabras y el tiempo de lectura se calculan al guardar.'}
                </FieldDescription>
              </Field>

              <Field orientation='horizontal'>
                <Switch
                  id={`${locale}.noindex`}
                  name={`${locale}.noindex`}
                  defaultChecked={values?.noindex ?? false}
                />
                <FieldLabel htmlFor={`${locale}.noindex`}>No indexar</FieldLabel>
              </Field>
            </CardContent>
          </Card>
        )
      })}

      <div className='flex justify-end'>
        <Button type='submit' disabled={isPending}>
          {isPending ? 'Guardando…' : 'Guardar cambios'}
        </Button>
      </div>
    </form>
  )
}

export default PostForm
