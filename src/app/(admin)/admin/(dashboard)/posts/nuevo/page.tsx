// Next Imports
import Link from 'next/link'

// Component Imports
import { Button } from '@/components/admin/ui/button'
import PostForm, { type PostFormValues, type TagOption } from '@/components/admin/views/posts/PostForm'

// Lib Imports
import { createSupabaseServerClient } from '@/lib/supabase/server'

export const metadata = { title: 'Nuevo post' }

const LOCALES = ['es', 'en'] as const

/** Un artículo vacío: el mismo formulario que la edición, sin datos. */
const EMPTY_TRANSLATION = {
  slug: '',
  title: '',
  focusKeyphrase: '',
  ogTitle: '',
  ogDescription: '',
  seoTitle: '',
  seoDescription: '',
  ogImage: '',
  coverAlt: '',
  excerpt: '',
  body: '',
  status: 'draft',
  publishedAt: '',
  noindex: false,
  readingMinutes: null,
  wordCount: null
}

const NewPostPage = async () => {
  const supabase = await createSupabaseServerClient()
  const { data: allTags } = await supabase
    .from('tags')
    .select('id, tag_translations(locale, name)')
    .order('sort_order')

  const tags: TagOption[] = (allTags ?? []).map(tag => ({
    id: tag.id,
    name: tag.tag_translations.find(t => t.locale === 'es')?.name ?? tag.id
  }))

  const values: PostFormValues = {
    key: '',
    tagIds: [],
    translations: Object.fromEntries(LOCALES.map(locale => [locale, { ...EMPTY_TRANSLATION }]))
  }

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex flex-wrap items-start justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-semibold tracking-tight'>Nuevo artículo</h1>
          <p className='text-muted-foreground text-sm'>
            Escribilo entero acá. La portada se sube después de crearlo, cuando ya hay dónde guardarla.
          </p>
        </div>
        <Button variant='outline' size='sm' render={<Link href='/admin/posts' />}>
          Cancelar
        </Button>
      </div>

      <PostForm post={values} tags={tags} mode='create' />
    </div>
  )
}

export default NewPostPage
