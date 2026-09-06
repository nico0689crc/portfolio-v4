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
import { updateProject, type ProjectFormState } from '@/lib/admin/projects'

export type ProjectTranslationValues = {
  slug: string
  title: string
  description: string
  seoTitle: string
  seoDescription: string
  noindex: boolean
}

export type ProjectFormValues = {
  key: string
  category: string
  status: string
  sortOrder: number
  techs: string[]
  links: Record<string, string>
  translations: Record<string, ProjectTranslationValues>
}

const LINK_FIELDS = [
  { name: 'demo', label: 'Demo' },
  { name: 'github', label: 'GitHub' },
  { name: 'canva', label: 'Canva' },
  { name: 'figjam', label: 'FigJam' },
  { name: 'lofi', label: 'Lo-fi' }
] as const

const LOCALE_LABELS: Record<string, string> = { es: 'Español', en: 'Inglés' }

// `items` es lo que hace que el trigger muestre la etiqueta y no el valor crudo.
const CATEGORIES = [
  { value: 'fullstack', label: 'Full Stack' },
  { value: 'ux-ui', label: 'UX/UI' },
  { value: 'wordpress', label: 'WordPress' }
]

const STATUSES = [
  { value: 'draft', label: 'Borrador' },
  { value: 'published', label: 'Publicado' }
]

/**
 * Base UI escribe un input oculto cuando el Root lleva `name`, asi que el
 * select participa del form nativo y la action lo lee de FormData como
 * cualquier otro campo.
 */
const EnumField = ({
  name,
  label,
  defaultValue,
  options
}: {
  name: string
  label: string
  defaultValue: string
  options: { value: string; label: string }[]
}) => (
  <Field>
    <FieldLabel htmlFor={name}>{label}</FieldLabel>
    <Select name={name} defaultValue={defaultValue} items={options}>
      <SelectTrigger id={name} className='w-full'>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map(option => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </Field>
)

/**
 * One locale's column. Both are rendered side by side and submitted together:
 * the fields are named `<locale>.<field>` so a single FormData carries the
 * whole translation set, which is what lets the action save them atomically.
 */
const TranslationColumn = ({ locale, values }: { locale: string; values: ProjectTranslationValues }) => (
  <div className='flex flex-col gap-4'>
    <h3 className='text-sm font-semibold tracking-tight'>{LOCALE_LABELS[locale] ?? locale}</h3>

    <Field>
      <FieldLabel htmlFor={`${locale}.slug`}>Slug</FieldLabel>
      <Input id={`${locale}.slug`} name={`${locale}.slug`} defaultValue={values.slug} required />
      <FieldDescription>
        Cambiarlo deja una redirección automática desde el anterior.
      </FieldDescription>
    </Field>

    <Field>
      <FieldLabel htmlFor={`${locale}.title`}>Título</FieldLabel>
      <Input id={`${locale}.title`} name={`${locale}.title`} defaultValue={values.title} required />
    </Field>

    <Field>
      <FieldLabel htmlFor={`${locale}.description`}>Descripción</FieldLabel>
      <Textarea
        id={`${locale}.description`}
        name={`${locale}.description`}
        defaultValue={values.description}
        rows={4}
        required
      />
    </Field>

    <Field>
      <FieldLabel htmlFor={`${locale}.seoTitle`}>Título SEO</FieldLabel>
      <Input id={`${locale}.seoTitle`} name={`${locale}.seoTitle`} defaultValue={values.seoTitle} />
      <FieldDescription>Si lo dejás vacío se usa el título.</FieldDescription>
    </Field>

    <Field>
      <FieldLabel htmlFor={`${locale}.seoDescription`}>Descripción SEO</FieldLabel>
      <Textarea
        id={`${locale}.seoDescription`}
        name={`${locale}.seoDescription`}
        defaultValue={values.seoDescription}
        rows={3}
      />
      <FieldDescription>Si la dejás vacía se usa la descripción.</FieldDescription>
    </Field>

    <Field orientation='horizontal'>
      <Switch id={`${locale}.noindex`} name={`${locale}.noindex`} defaultChecked={values.noindex} />
      <FieldLabel htmlFor={`${locale}.noindex`}>No indexar</FieldLabel>
    </Field>
  </div>
)

const ProjectForm = ({ project }: { project: ProjectFormValues }) => {
  const [state, formAction, isPending] = useActionState<ProjectFormState, FormData>(
    updateProject.bind(null, project.key),
    { error: null, saved: false }
  )

  useEffect(() => {
    if (state.saved) toast.success('Proyecto guardado')
    if (state.error) toast.error(state.error)
  }, [state])

  return (
    <form action={formAction} className='flex flex-col gap-6'>
      <Card>
        <CardHeader>
          <CardTitle>Datos del proyecto</CardTitle>
        </CardHeader>
        <CardContent className='grid gap-4 sm:grid-cols-2'>
          <EnumField
            name='category'
            label='Categoría'
            defaultValue={project.category}
            options={CATEGORIES}
          />

          <EnumField name='status' label='Estado' defaultValue={project.status} options={STATUSES} />

          <Field>
            <FieldLabel htmlFor='sortOrder'>Orden</FieldLabel>
            <Input id='sortOrder' name='sortOrder' type='number' defaultValue={project.sortOrder} />
            <FieldDescription>Menor primero, en el listado público.</FieldDescription>
          </Field>

          <Field>
            <FieldLabel htmlFor='techs'>Tecnologías</FieldLabel>
            <Input id='techs' name='techs' defaultValue={project.techs.join(', ')} />
            <FieldDescription>Separadas por coma. El orden se respeta.</FieldDescription>
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Enlaces</CardTitle>
        </CardHeader>
        <CardContent className='grid gap-4 sm:grid-cols-2'>
          {LINK_FIELDS.map(({ name, label }) => (
            <Field key={name}>
              <FieldLabel htmlFor={`links.${name}`}>{label}</FieldLabel>
              <Input
                id={`links.${name}`}
                name={`links.${name}`}
                type='url'
                defaultValue={project.links[name] ?? ''}
                placeholder='https://…'
              />
            </Field>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contenido</CardTitle>
        </CardHeader>
        <CardContent className='grid gap-8 md:grid-cols-2'>
          {Object.entries(project.translations).map(([locale, values]) => (
            <TranslationColumn key={locale} locale={locale} values={values} />
          ))}
        </CardContent>
      </Card>

      <div className='flex justify-end gap-3'>
        <Button type='submit' disabled={isPending}>
          {isPending ? 'Guardando…' : 'Guardar cambios'}
        </Button>
      </div>
    </form>
  )
}

export default ProjectForm
