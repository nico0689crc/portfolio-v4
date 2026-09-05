// Next Imports
import { notFound } from 'next/navigation'

// Component Imports
import PostForm, { type PostFormValues } from '@/components/admin/views/posts/PostForm'

// Lib Imports
import { createSupabaseServerClient } from '@/lib/supabase/server'

const LOCALES = ['es', 'en'] as const

export const generateMetadata = async ({ params }: { params: Promise<{ key: string }> }) => {
  const { key } = await params

  return { title: `Post · ${key}` }
}

const AdminPostEditPage = async ({ params }: { params: Promise<{ key: string }> }) => {
  const { key } = await params
  const supabase = await createSupabaseServerClient()

  const { data: post } = await supabase
    .from('posts')
    .select(
      `key,
       post_translations(locale, slug, title, excerpt, body, status, published_at, noindex,
                         reading_minutes, word_count)`
    )
    .eq('key', key)
    .maybeSingle()

  if (!post) notFound()

  const values: PostFormValues = {
    key: post.key,
    translations: Object.fromEntries(
      LOCALES.map(locale => {
        const row = post.post_translations.find(t => t.locale === locale)

        return [
          locale,
          {
            slug: row?.slug ?? '',
            title: row?.title ?? '',
            excerpt: row?.excerpt ?? '',
            body: row?.body ?? '',
            status: row?.status ?? 'draft',
            // El input date quiere YYYY-MM-DD, no un timestamp completo.
            publishedAt: row?.published_at ? row.published_at.slice(0, 10) : '',
            noindex: row?.noindex ?? false,
            readingMinutes: row?.reading_minutes ?? null,
            wordCount: row?.word_count ?? null
          }
        ]
      })
    )
  }

  return (
    <div className='flex flex-col gap-6'>
      <div>
        <h1 className='text-2xl font-semibold tracking-tight'>
          {values.translations.es.title || post.key}
        </h1>
        <p className='text-muted-foreground font-mono text-xs'>{post.key}</p>
      </div>

      <PostForm post={values} />
    </div>
  )
}

export default AdminPostEditPage
