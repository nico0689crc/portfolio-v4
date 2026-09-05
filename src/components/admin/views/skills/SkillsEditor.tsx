'use client'

// React Imports
import { useActionState, useEffect, useState } from 'react'

// Third-party Imports
import { toast } from 'sonner'
import { Plus, Trash2 } from 'lucide-react'

// Component Imports
import { Button } from '@/components/admin/ui/button'
import { Card, CardContent, CardHeader } from '@/components/admin/ui/card'
import { Field, FieldDescription, FieldLabel } from '@/components/admin/ui/field'
import { Input } from '@/components/admin/ui/input'
import { Switch } from '@/components/admin/ui/switch'

// Lib Imports
import { saveSkills, type SkillsFormState } from '@/lib/admin/skills-actions'

export type SkillValues = {
  id: string
  nameDefault: string
  isTranslatable: boolean
  names: Record<string, string>
}

export type CategoryValues = {
  id: string
  slug: string
  labels: Record<string, string>
  skills: SkillValues[]
}

const LOCALES = ['es', 'en'] as const
const LOCALE_LABELS: Record<string, string> = { es: 'ES', en: 'EN' }

const SkillsEditor = ({ initialCategories }: { initialCategories: CategoryValues[] }) => {
  const [categories, setCategories] = useState(initialCategories)
  const [deletedCategories, setDeletedCategories] = useState<string[]>([])
  const [deletedSkills, setDeletedSkills] = useState<string[]>([])

  const [state, formAction, isPending] = useActionState<SkillsFormState, FormData>(saveSkills, {
    error: null,
    saved: false
  })

  useEffect(() => {
    if (state.saved) toast.success('Skills guardadas')
    if (state.error) toast.error(state.error)
  }, [state])

  const existingSkillIds = new Set(
    initialCategories.flatMap(category => category.skills.map(skill => skill.id))
  )

  const addCategory = () =>
    setCategories(current => [
      ...current,
      { id: crypto.randomUUID(), slug: '', labels: { es: '', en: '' }, skills: [] }
    ])

  const removeCategory = (id: string) => {
    setCategories(current => current.filter(category => category.id !== id))
    if (initialCategories.some(category => category.id === id)) {
      setDeletedCategories(current => [...current, id])
    }
  }

  const addSkill = (categoryId: string) =>
    setCategories(current =>
      current.map(category =>
        category.id === categoryId
          ? {
              ...category,
              skills: [
                ...category.skills,
                { id: crypto.randomUUID(), nameDefault: '', isTranslatable: false, names: { es: '', en: '' } }
              ]
            }
          : category
      )
    )

  const removeSkill = (categoryId: string, skillId: string) => {
    setCategories(current =>
      current.map(category =>
        category.id === categoryId
          ? { ...category, skills: category.skills.filter(skill => skill.id !== skillId) }
          : category
      )
    )
    if (existingSkillIds.has(skillId)) setDeletedSkills(current => [...current, skillId])
  }

  return (
    <form action={formAction} className='flex flex-col gap-4'>
      <input type='hidden' name='categoryIds' value={JSON.stringify(categories.map(c => c.id))} />
      <input
        type='hidden'
        name='skillIds'
        value={JSON.stringify(
          Object.fromEntries(categories.map(c => [c.id, c.skills.map(s => s.id)]))
        )}
      />
      <input type='hidden' name='deletedCategories' value={JSON.stringify(deletedCategories)} />
      <input type='hidden' name='deletedSkills' value={JSON.stringify(deletedSkills)} />

      {categories.map(category => (
        <Card key={category.id}>
          <CardHeader className='grid gap-4 sm:grid-cols-[1fr_1fr_1fr_auto]'>
            <Field>
              <FieldLabel htmlFor={`${category.id}.slug`}>Slug</FieldLabel>
              <Input id={`${category.id}.slug`} name={`${category.id}.slug`} defaultValue={category.slug} />
            </Field>
            {LOCALES.map(locale => (
              <Field key={locale}>
                <FieldLabel htmlFor={`${category.id}.${locale}.label`}>
                  Etiqueta {LOCALE_LABELS[locale]}
                </FieldLabel>
                <Input
                  id={`${category.id}.${locale}.label`}
                  name={`${category.id}.${locale}.label`}
                  defaultValue={category.labels[locale] ?? ''}
                />
              </Field>
            ))}
            <Button
              type='button'
              variant='ghost'
              size='icon'
              aria-label='Eliminar categoría'
              className='self-end'
              onClick={() => removeCategory(category.id)}
            >
              <Trash2 className='text-destructive size-4' />
            </Button>
          </CardHeader>

          <CardContent className='flex flex-col gap-3'>
            {category.skills.map(skill => (
              <div
                key={skill.id}
                className='border-border grid items-end gap-3 rounded-md border p-3 sm:grid-cols-[1.5fr_auto_1fr_1fr_auto]'
              >
                <Field>
                  <FieldLabel htmlFor={`${skill.id}.name_default`}>Nombre</FieldLabel>
                  <Input
                    id={`${skill.id}.name_default`}
                    name={`${skill.id}.name_default`}
                    defaultValue={skill.nameDefault}
                  />
                </Field>
                <Field orientation='horizontal'>
                  <Switch
                    id={`${skill.id}.is_translatable`}
                    name={`${skill.id}.is_translatable`}
                    defaultChecked={skill.isTranslatable}
                  />
                  <FieldLabel htmlFor={`${skill.id}.is_translatable`}>Traducible</FieldLabel>
                </Field>
                {LOCALES.map(locale => (
                  <Field key={locale}>
                    <FieldLabel htmlFor={`${skill.id}.${locale}.name`}>{LOCALE_LABELS[locale]}</FieldLabel>
                    <Input
                      id={`${skill.id}.${locale}.name`}
                      name={`${skill.id}.${locale}.name`}
                      defaultValue={skill.names[locale] ?? ''}
                    />
                  </Field>
                ))}
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  aria-label='Eliminar skill'
                  onClick={() => removeSkill(category.id, skill.id)}
                >
                  <Trash2 className='text-destructive size-4' />
                </Button>
              </div>
            ))}

            <div>
              <Button type='button' variant='outline' size='sm' onClick={() => addSkill(category.id)}>
                <Plus className='size-4' /> Agregar skill
              </Button>
            </div>
            <FieldDescription>
              Los nombres por idioma sólo se usan si «Traducible» está activo. Para algo como «React» dejalo
              apagado.
            </FieldDescription>
          </CardContent>
        </Card>
      ))}

      <div className='flex items-center justify-between gap-3'>
        <Button type='button' variant='outline' onClick={addCategory}>
          <Plus className='size-4' /> Agregar categoría
        </Button>
        <Button type='submit' disabled={isPending}>
          {isPending ? 'Guardando…' : 'Guardar cambios'}
        </Button>
      </div>
    </form>
  )
}

export default SkillsEditor
