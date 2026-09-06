'use client'

// React Imports
import { useActionState, useEffect, useState } from 'react'

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/admin/ui/tabs'
import { Textarea } from '@/components/admin/ui/textarea'
import BodyEditor from './BodyEditor'
import CharCounter from '@/components/admin/shared/CharCounter'
import SeoAnalysis from './SeoAnalysis'
import SerpPreview, { DESCRIPTION_LIMIT, TITLE_LIMIT } from '@/components/admin/shared/SerpPreview'

// Lib Imports
import { createPost, updatePost, type PostFormState } from '@/lib/admin/posts-actions'
import { SITE_URL } from '@/lib/seo'
import { slugify } from '@/lib/slug'

export type PostTranslationValues = {
  slug: string
  title: string
  focusKeyphrase: string
  ogTitle: string
  ogDescription: string
  seoTitle: string
  seoDescription: string
  ogImage: string
  coverAlt: string
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
  tagIds: string[]
  translations: Record<string, PostTranslationValues>
}

export type TagOption = { id: string; name: string }

const LOCALES = ['es', 'en'] as const
const LOCALE_LABELS: Record<string, string> = { es: 'Español', en: 'Inglés' }

const STATUSES = [
  { value: 'draft', label: 'Borrador' },
  { value: 'published', label: 'Publicado' }
]

/** Los campos que alimentan la vista previa de Google, en vivo. */
type LivePreview = {
  title: string
  seoTitle: string
  excerpt: string
  seoDescription: string
  slug: string
  keyphrase: string
  body: string
}

const LocalePanel = ({
  locale,
  postKey,
  values,
  mode
}: {
  locale: string
  postKey: string | null
  values: PostTranslationValues
  mode: 'create' | 'edit'
}) => {
  // El slug sigue al título mientras nadie lo toque. Una vez editado a mano
  // deja de seguirlo para siempre: pisar un slug escrito a propósito porque
  // alguien corrigió una tilde del título es la clase de sorpresa que hace
  // desconfiar del formulario entero.
  const [slugTouched, setSlugTouched] = useState(mode === 'edit')

  const [live, setLive] = useState<LivePreview>({
    title: values.title,
    seoTitle: values.seoTitle,
    excerpt: values.excerpt,
    seoDescription: values.seoDescription,
    slug: values.slug,
    keyphrase: values.focusKeyphrase,
    body: values.body
  })

  const set = (key: keyof LivePreview) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setLive(current => ({ ...current, [key]: event.target.value }))

  const onTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const title = event.target.value

    setLive(current => ({
      ...current,
      title,
      slug: slugTouched ? current.slug : slugify(title)
    }))
  }

  // El fallback replica el del servidor: lo que se previsualiza es lo que se
  // va a servir cuando el override está vacío.
  const serpTitle = live.seoTitle || live.title
  const serpDescription = live.seoDescription || live.excerpt

  return (
    <div className='flex flex-col gap-6'>
      <Card>
        <CardHeader>
          <CardTitle>Contenido</CardTitle>
        </CardHeader>
        <CardContent className='flex flex-col gap-4'>
          <Field>
            <FieldLabel htmlFor={`${locale}.title`}>Título</FieldLabel>
            <Input
              id={`${locale}.title`}
              name={`${locale}.title`}
              defaultValue={values.title}
              onChange={onTitleChange}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor={`${locale}.slug`}>Slug</FieldLabel>
            <Input
              id={`${locale}.slug`}
              name={`${locale}.slug`}
              value={live.slug}
              onChange={event => {
                setSlugTouched(true)
                set('slug')(event)
              }}
            />
            <FieldDescription>
              {mode === 'create'
                ? 'Se genera del título. Editalo si querés otra URL.'
                : 'Cambiarlo deja una redirección desde el anterior.'}
            </FieldDescription>
          </Field>

          <Field>
            <FieldLabel htmlFor={`${locale}.excerpt`}>Bajada</FieldLabel>
            <Textarea
              id={`${locale}.excerpt`}
              name={`${locale}.excerpt`}
              rows={2}
              defaultValue={values.excerpt}
              onChange={set('excerpt')}
            />
            <FieldDescription>Se usa en el listado y como descripción si no ponés una propia.</FieldDescription>
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cuerpo</CardTitle>
        </CardHeader>
        <CardContent>
          <BodyEditor
            postKey={postKey}
            name={`${locale}.body`}
            defaultValue={values.body}
            onChange={body => setLive(current => ({ ...current, body }))}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>SEO y redes</CardTitle>
        </CardHeader>
        <CardContent className='flex flex-col gap-4'>
          <Field>
            <FieldLabel htmlFor={`${locale}.focus_keyphrase`}>Frase clave</FieldLabel>
            <Input
              id={`${locale}.focus_keyphrase`}
              name={`${locale}.focus_keyphrase`}
              defaultValue={values.focusKeyphrase}
              onChange={set('keyphrase')}
              placeholder='desarrollador web corrientes'
            />
            <FieldDescription>
              Lo que alguien escribiría en Google para llegar acá. Todo el análisis se mide contra esto.
            </FieldDescription>
          </Field>

          <SeoAnalysis
            keyphrase={live.keyphrase}
            title={live.title}
            seoTitle={live.seoTitle}
            description={serpDescription}
            slug={live.slug}
            body={live.body}
          />

          <SerpPreview
            title={serpTitle}
            description={serpDescription}
            url={`${SITE_URL}${locale === 'es' ? '/es' : ''}/blog/${live.slug || '…'}`}
          />

          <Field>
            <FieldLabel htmlFor={`${locale}.seoTitle`}>Título SEO</FieldLabel>
            <Input
              id={`${locale}.seoTitle`}
              name={`${locale}.seo_title`}
              defaultValue={values.seoTitle}
              onChange={set('seoTitle')}
            />
            <FieldDescription>
              Vacío usa el título. <CharCounter value={serpTitle} limit={TITLE_LIMIT} />
            </FieldDescription>
          </Field>

          <Field>
            <FieldLabel htmlFor={`${locale}.seoDescription`}>Descripción SEO</FieldLabel>
            <Textarea
              id={`${locale}.seoDescription`}
              name={`${locale}.seo_description`}
              rows={2}
              defaultValue={values.seoDescription}
              onChange={set('seoDescription')}
            />
            <FieldDescription>
              Vacía usa la bajada. <CharCounter value={serpDescription} limit={DESCRIPTION_LIMIT} />
            </FieldDescription>
          </Field>

          <div className='grid gap-4 sm:grid-cols-2'>
            <Field>
              <FieldLabel htmlFor={`${locale}.ogTitle`}>Titular para redes</FieldLabel>
              <Input
                id={`${locale}.ogTitle`}
                name={`${locale}.og_title`}
                defaultValue={values.ogTitle}
              />
              <FieldDescription>
                Vacío usa el de SEO. Un titular que funciona en Google suele ser malo en un feed, donde
                compite por curiosidad y no por precisión.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor={`${locale}.ogDescription`}>Descripción para redes</FieldLabel>
              <Textarea
                id={`${locale}.ogDescription`}
                name={`${locale}.og_description`}
                rows={2}
                defaultValue={values.ogDescription}
              />
            </Field>
          </div>

          <div className='grid gap-4 sm:grid-cols-2'>
            <Field>
              <FieldLabel htmlFor={`${locale}.coverAlt`}>Alt de la portada</FieldLabel>
              <Input
                id={`${locale}.coverAlt`}
                name={`${locale}.cover_alt`}
                defaultValue={values.coverAlt}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={`${locale}.ogImage`}>Imagen social</FieldLabel>
              <Input
                id={`${locale}.ogImage`}
                name={`${locale}.og_image`}
                defaultValue={values.ogImage}
                placeholder='ruta en el bucket'
              />
              <FieldDescription>1200×630. Vacía usa la portada.</FieldDescription>
            </Field>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Publicación</CardTitle>
        </CardHeader>
        <CardContent className='flex flex-col gap-4'>
          <div className='grid gap-4 sm:grid-cols-2'>
          <Field>
            <FieldLabel htmlFor={`${locale}.status`}>Estado</FieldLabel>
            {/* Por idioma: la traducción puede seguir en borrador mientras el
                original ya salió. */}
            <Select name={`${locale}.status`} defaultValue={values.status} items={STATUSES}>
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
              defaultValue={values.publishedAt}
            />
            <FieldDescription>Vacío y publicado usa hoy.</FieldDescription>
          </Field>
          </div>

          {/* Fuera de la grilla: es un interruptor con su explicación, no un
              campo más, y forzarlo en una columna lo dejaba flotando sin
              alinearse con nada. */}
          <Field orientation='horizontal'>
            <Switch
              id={`${locale}.noindex`}
              name={`${locale}.noindex`}
              defaultChecked={values.noindex}
            />
            <div className='flex flex-col'>
              <FieldLabel htmlFor={`${locale}.noindex`}>No indexar</FieldLabel>
              <FieldDescription>
                El artículo sigue online y accesible por su URL, pero se le pide a Google que no lo
                muestre en resultados.
              </FieldDescription>
            </div>
          </Field>
        </CardContent>
      </Card>
    </div>
  )
}

const PostForm = ({
  post,
  tags,
  mode = 'edit'
}: {
  post: PostFormValues
  tags: TagOption[]
  mode?: 'create' | 'edit'
}) => {
  const [tagIds, setTagIds] = useState<string[]>(post.tagIds)

  const toggleTag = (id: string) =>
    setTagIds(current => (current.includes(id) ? current.filter(t => t !== id) : [...current, id]))

  const [state, formAction, isPending] = useActionState<PostFormState, FormData>(
    mode === 'create' ? createPost : updatePost.bind(null, post.key),
    { error: null, saved: false }
  )

  useEffect(() => {
    if (state.saved) toast.success('Post guardado')
    if (state.error) toast.error(state.error)
  }, [state])

  return (
    <form action={formAction} className='flex flex-col gap-6'>
      <Tabs defaultValue='es'>
        <TabsList>
          {LOCALES.map(locale => (
            <TabsTrigger key={locale} value={locale}>
              {LOCALE_LABELS[locale]}
            </TabsTrigger>
          ))}
        </TabsList>

        {LOCALES.map(locale => (
          // `keepMounted` es obligatorio: sin él el panel inactivo sale del DOM
          // y sus campos no viajan en el FormData, así que guardar desde una
          // pestaña borraría el otro idioma entero.
          <TabsContent key={locale} value={locale} keepMounted className='pt-6'>
            <LocalePanel
              locale={locale}
              // En alta todavía no hay post, así que no hay dónde guardar un
              // archivo: el editor deshabilita la subida en vez de fallar.
              postKey={mode === 'create' ? null : post.key}
              values={post.translations[locale]}
              mode={mode}
            />
          </TabsContent>
        ))}
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Tags</CardTitle>
        </CardHeader>
        <CardContent>
          <input type='hidden' name='tagIds' value={JSON.stringify(tagIds)} />
          {tags.length === 0 ? (
            <p className='text-muted-foreground text-sm'>
              Todavía no hay tags. Se crean en su propia pantalla.
            </p>
          ) : (
            <div className='flex flex-wrap gap-2'>
              {tags.map(tag => (
                <Button
                  key={tag.id}
                  type='button'
                  size='sm'
                  variant={tagIds.includes(tag.id) ? 'default' : 'outline'}
                  onClick={() => toggleTag(tag.id)}
                >
                  {tag.name}
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pegado abajo: el formulario es largo y el botón no puede quedar a
          quince scrolls del campo que se acaba de tocar. */}
      <div className='bg-background/80 border-border sticky bottom-0 -mx-2 flex justify-end border-t px-2 py-3 backdrop-blur'>
        <Button type='submit' disabled={isPending}>
          {isPending
            ? mode === 'create'
              ? 'Creando…'
              : 'Guardando…'
            : mode === 'create'
              ? 'Crear artículo'
              : 'Guardar cambios'}
        </Button>
      </div>
    </form>
  )
}

export default PostForm
