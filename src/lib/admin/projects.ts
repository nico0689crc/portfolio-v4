'use server'

// Third-party Imports
import { z } from 'zod'

// Lib Imports
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { updateTags } from '@/lib/content/cache'
import { TAGS } from '@/lib/content/tags'
import { requireAdmin } from './auth'

export type ProjectFormState = {
  error: string | null
  saved: boolean
}

/**
 * Locales are hardcoded rather than read from the `locales` table on every
 * save. The bilingual editor renders a fixed pair of columns, so a third
 * language is a UI change either way — reading it dynamically would only hide
 * that the form cannot handle one.
 */
const LOCALES = ['es', 'en'] as const

const slug = z
  .string()
  .trim()
  .min(1, 'El slug no puede estar vacío')
  // Matches what the public route can actually serve: the URL is built from
  // this verbatim, so a space or an uppercase letter here becomes a 404 or a
  // duplicate URL that crawlers treat as separate pages.
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Sólo minúsculas, números y guiones')

const translation = z.object({
  slug,
  title: z.string().trim().min(1, 'El título no puede estar vacío'),
  description: z.string().trim().min(1, 'La descripción no puede estar vacía'),
  seoTitle: z.string().trim().max(70).optional(),
  seoDescription: z.string().trim().max(200).optional(),
  noindex: z.boolean()
})

const schema = z.object({
  category: z.enum(['fullstack', 'ux-ui', 'wordpress']),
  status: z.enum(['draft', 'published']),
  sortOrder: z.coerce.number().int(),
  techs: z.array(z.string().trim().min(1)),
  links: z.record(z.string(), z.string().url()),
  translations: z.record(z.string(), translation)
})

/** `''` is what an untouched optional input submits; the column wants null. */
function orNull(value: string | undefined): string | null {
  return value && value.length > 0 ? value : null
}

export async function updateProject(
  key: string,
  _prev: ProjectFormState,
  formData: FormData
): Promise<ProjectFormState> {
  await requireAdmin()

  const parsed = schema.safeParse({
    category: formData.get('category'),
    status: formData.get('status'),
    sortOrder: formData.get('sortOrder'),
    // Comma-separated in the form because the order is meaningful and a tag
    // widget would reorder on every edit.
    techs: String(formData.get('techs') ?? '')
      .split(',')
      .map(tech => tech.trim())
      .filter(Boolean),
    links: Object.fromEntries(
      (['demo', 'github', 'canva', 'figjam', 'lofi'] as const)
        .map(name => [name, String(formData.get(`links.${name}`) ?? '').trim()])
        .filter(([, value]) => value.length > 0)
    ),
    translations: Object.fromEntries(
      LOCALES.map(locale => [
        locale,
        {
          slug: formData.get(`${locale}.slug`),
          title: formData.get(`${locale}.title`),
          description: formData.get(`${locale}.description`),
          seoTitle: formData.get(`${locale}.seoTitle`),
          seoDescription: formData.get(`${locale}.seoDescription`),
          noindex: formData.get(`${locale}.noindex`) === 'on'
        }
      ])
    )
  })

  if (!parsed.success) {
    const first = parsed.error.issues[0]

    return { error: `${first.path.join('.')}: ${first.message}`, saved: false }
  }

  const { category, status, sortOrder, techs, links, translations } = parsed.data
  const supabase = await createSupabaseServerClient()

  const { data: project, error: lookupError } = await supabase
    .from('projects')
    .select('id')
    .eq('key', key)
    .maybeSingle()

  if (lookupError || !project) {
    return { error: 'No se encontró el proyecto.', saved: false }
  }

  const { error: projectError } = await supabase
    .from('projects')
    .update({ category, status, sort_order: sortOrder, techs, links })
    .eq('id', project.id)

  if (projectError) {
    return { error: `No se pudo guardar: ${projectError.message}`, saved: false }
  }

  // Both locales go in one upsert, not a loop. A partial save would leave the
  // languages describing different things, and renaming a slug in one language
  // while the other failed would record a redirect for a rename that only half
  // happened.
  const { error: translationError } = await supabase.from('project_translations').upsert(
    LOCALES.map(locale => ({
      project_id: project.id,
      locale,
      slug: translations[locale].slug,
      title: translations[locale].title,
      description: translations[locale].description,
      seo_title: orNull(translations[locale].seoTitle),
      seo_description: orNull(translations[locale].seoDescription),
      noindex: translations[locale].noindex
    })),
    { onConflict: 'project_id,locale' }
  )

  if (translationError) {
    // The unique index on (locale, slug) is the likely cause and the only one
    // the editor can act on, so it gets its own message.
    const message = translationError.code === '23505'
      ? 'Ese slug ya lo usa otro proyecto en el mismo idioma.'
      : translationError.message

    return { error: `No se pudo guardar: ${message}`, saved: false }
  }

  // Renaming a slug is recorded in `slug_redirects` by a database trigger, so
  // nothing here has to write it — but the public pages read the old slug from
  // cache until these tags are invalidated.
  updateTags([TAGS.projects, TAGS.project(key), TAGS.all])

  return { error: null, saved: true }
}
