'use client'

// React Imports
import { useActionState, useEffect, useState } from 'react'

// Third-party Imports
import { toast } from 'sonner'
import { Plus, Trash2 } from 'lucide-react'

// Component Imports
import { Button } from '@/components/admin/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/admin/ui/card'
import { Field, FieldDescription, FieldLabel } from '@/components/admin/ui/field'
import { Input } from '@/components/admin/ui/input'
import { Textarea } from '@/components/admin/ui/textarea'

// Lib Imports
import { saveCaseStudy, type CaseStudyFormState } from '@/lib/admin/case-study-actions'

export type PhaseValues = {
  id: string
  slug: string
  translations: Record<string, { label: string; title: string; body: string }>
}

export type MetricValues = {
  id: string
  translations: Record<string, { value: string; label: string }>
}

export type CaseStudyValues = {
  projectKey: string
  prose: Record<string, Record<string, string>>
  phases: PhaseValues[]
  metrics: MetricValues[]
}

const LOCALES = ['es', 'en'] as const
const LOCALE_LABELS: Record<string, string> = { es: 'Español', en: 'Inglés' }

const SHORT_FIELDS = [
  { name: 'role', label: 'Rol' },
  { name: 'duration', label: 'Duración' },
  { name: 'team', label: 'Equipo' }
]

const LONG_FIELDS = [
  { name: 'overview', label: 'Resumen', help: 'El párrafo bajo el título.' },
  { name: 'context', label: 'Contexto' },
  { name: 'problem', label: 'Problema' },
  { name: 'process_desc', label: 'Descripción del proceso' },
  { name: 'results', label: 'Resultados' },
  { name: 'learnings', label: 'Aprendizajes' }
]

const NOTE_FIELDS = [
  { name: 'note_html', label: 'Nota', help: 'Prosa, no HTML pese al nombre de la columna.' },
  { name: 'note_link_text', label: 'Texto del enlace', help: 'Tiene que aparecer literal dentro de la nota.' },
  { name: 'note_url', label: 'URL del enlace' }
]

const CaseStudyForm = ({ values }: { values: CaseStudyValues }) => {
  const [phases, setPhases] = useState(values.phases)
  const [metrics, setMetrics] = useState(values.metrics)
  const [deletedPhases, setDeletedPhases] = useState<string[]>([])
  const [deletedMetrics, setDeletedMetrics] = useState<string[]>([])

  const [state, formAction, isPending] = useActionState<CaseStudyFormState, FormData>(
    saveCaseStudy.bind(null, values.projectKey),
    { error: null, saved: false }
  )

  useEffect(() => {
    if (state.saved) toast.success('Caso guardado')
    if (state.error) toast.error(state.error)
  }, [state])

  const removePhase = (id: string) => {
    setPhases(current => current.filter(phase => phase.id !== id))
    if (values.phases.some(phase => phase.id === id)) setDeletedPhases(current => [...current, id])
  }

  const removeMetric = (id: string) => {
    setMetrics(current => current.filter(metric => metric.id !== id))
    if (values.metrics.some(metric => metric.id === id)) setDeletedMetrics(current => [...current, id])
  }

  return (
    <form action={formAction} className='flex flex-col gap-6'>
      <input type='hidden' name='phaseIds' value={JSON.stringify(phases.map(phase => phase.id))} />
      <input type='hidden' name='metricIds' value={JSON.stringify(metrics.map(metric => metric.id))} />
      <input type='hidden' name='deletedPhases' value={JSON.stringify(deletedPhases)} />
      <input type='hidden' name='deletedMetrics' value={JSON.stringify(deletedMetrics)} />

      <Card>
        <CardHeader>
          <CardTitle>Prosa</CardTitle>
        </CardHeader>
        <CardContent className='grid gap-8 md:grid-cols-2'>
          {LOCALES.map(locale => (
            <div key={locale} className='flex flex-col gap-4'>
              <h4 className='text-muted-foreground text-xs font-semibold tracking-widest uppercase'>
                {LOCALE_LABELS[locale]}
              </h4>

              {SHORT_FIELDS.map(field => (
                <Field key={field.name}>
                  <FieldLabel htmlFor={`${locale}.${field.name}`}>{field.label}</FieldLabel>
                  <Input
                    id={`${locale}.${field.name}`}
                    name={`${locale}.${field.name}`}
                    defaultValue={values.prose[locale]?.[field.name] ?? ''}
                  />
                </Field>
              ))}

              {LONG_FIELDS.map(field => (
                <Field key={field.name}>
                  <FieldLabel htmlFor={`${locale}.${field.name}`}>{field.label}</FieldLabel>
                  <Textarea
                    id={`${locale}.${field.name}`}
                    name={`${locale}.${field.name}`}
                    rows={3}
                    defaultValue={values.prose[locale]?.[field.name] ?? ''}
                  />
                  {field.help && <FieldDescription>{field.help}</FieldDescription>}
                </Field>
              ))}

              {NOTE_FIELDS.map(field => (
                <Field key={field.name}>
                  <FieldLabel htmlFor={`${locale}.${field.name}`}>{field.label}</FieldLabel>
                  <Input
                    id={`${locale}.${field.name}`}
                    name={`${locale}.${field.name}`}
                    defaultValue={values.prose[locale]?.[field.name] ?? ''}
                  />
                  {field.help && <FieldDescription>{field.help}</FieldDescription>}
                </Field>
              ))}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fases</CardTitle>
        </CardHeader>
        <CardContent className='flex flex-col gap-4'>
          {phases.map(phase => (
            <div key={phase.id} className='border-border flex flex-col gap-4 rounded-lg border p-4'>
              <div className='flex items-end gap-3'>
                <Field className='flex-1'>
                  <FieldLabel htmlFor={`${phase.id}.slug`}>Slug</FieldLabel>
                  <Input id={`${phase.id}.slug`} name={`${phase.id}.slug`} defaultValue={phase.slug} />
                  <FieldDescription>Elige el ícono en la página pública.</FieldDescription>
                </Field>
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  aria-label='Eliminar fase'
                  onClick={() => removePhase(phase.id)}
                >
                  <Trash2 className='text-destructive size-4' />
                </Button>
              </div>

              <div className='grid gap-4 md:grid-cols-2'>
                {LOCALES.map(locale => (
                  <div key={locale} className='flex flex-col gap-3'>
                    <span className='text-muted-foreground text-xs font-semibold uppercase'>
                      {LOCALE_LABELS[locale]}
                    </span>
                    <Input
                      name={`${phase.id}.${locale}.label`}
                      defaultValue={phase.translations[locale]?.label ?? ''}
                      placeholder='Etiqueta'
                      aria-label={`Etiqueta ${locale}`}
                    />
                    <Input
                      name={`${phase.id}.${locale}.title`}
                      defaultValue={phase.translations[locale]?.title ?? ''}
                      placeholder='Título'
                      aria-label={`Título ${locale}`}
                    />
                    <Textarea
                      name={`${phase.id}.${locale}.body`}
                      defaultValue={phase.translations[locale]?.body ?? ''}
                      rows={3}
                      placeholder='Cuerpo'
                      aria-label={`Cuerpo ${locale}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() =>
                setPhases(current => [
                  ...current,
                  {
                    id: crypto.randomUUID(),
                    slug: '',
                    translations: {
                      es: { label: '', title: '', body: '' },
                      en: { label: '', title: '', body: '' }
                    }
                  }
                ])
              }
            >
              <Plus className='size-4' /> Agregar fase
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Métricas</CardTitle>
        </CardHeader>
        <CardContent className='flex flex-col gap-3'>
          {metrics.map(metric => (
            <div
              key={metric.id}
              className='border-border grid items-end gap-3 rounded-md border p-3 sm:grid-cols-[1fr_1fr_auto]'
            >
              {LOCALES.map(locale => (
                <div key={locale} className='flex flex-col gap-2'>
                  <span className='text-muted-foreground text-xs font-semibold uppercase'>
                    {LOCALE_LABELS[locale]}
                  </span>
                  <Input
                    name={`${metric.id}.${locale}.value`}
                    defaultValue={metric.translations[locale]?.value ?? ''}
                    placeholder='+15%'
                    aria-label={`Valor ${locale}`}
                  />
                  <Input
                    name={`${metric.id}.${locale}.label`}
                    defaultValue={metric.translations[locale]?.label ?? ''}
                    placeholder='Etiqueta'
                    aria-label={`Etiqueta ${locale}`}
                  />
                </div>
              ))}
              <Button
                type='button'
                variant='ghost'
                size='icon'
                aria-label='Eliminar métrica'
                onClick={() => removeMetric(metric.id)}
              >
                <Trash2 className='text-destructive size-4' />
              </Button>
            </div>
          ))}

          <div>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() =>
                setMetrics(current => [
                  ...current,
                  {
                    id: crypto.randomUUID(),
                    translations: { es: { value: '', label: '' }, en: { value: '', label: '' } }
                  }
                ])
              }
            >
              <Plus className='size-4' /> Agregar métrica
            </Button>
          </div>
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

export default CaseStudyForm
