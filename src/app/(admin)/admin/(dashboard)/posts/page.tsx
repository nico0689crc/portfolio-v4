// Next Imports
import Link from 'next/link'

// Component Imports
import { Badge } from '@/components/admin/ui/badge'
import { Button } from '@/components/admin/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/admin/ui/card'
import NewPostForm from '@/components/admin/views/posts/NewPostForm'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/admin/ui/table'

// Lib Imports
import { createSupabaseServerClient } from '@/lib/supabase/server'

export const metadata = { title: 'Posts' }

const AdminPostsPage = async () => {
  const supabase = await createSupabaseServerClient()

  const { data: posts, error } = await supabase
    .from('posts')
    .select('key, created_at, post_translations(locale, title, slug, status)')
    .order('created_at', { ascending: false })

  if (error) {
    return <p className='text-destructive text-sm'>No se pudieron cargar los posts: {error.message}</p>
  }

  return (
    <div className='flex flex-col gap-6'>
      <div>
        <h1 className='text-2xl font-semibold tracking-tight'>Posts</h1>
        <p className='text-muted-foreground text-sm'>
          {posts.length === 0 ? 'El blog todavía no tiene entradas.' : `${posts.length} en total.`}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nuevo post</CardTitle>
        </CardHeader>
        <CardContent>
          <NewPostForm />
        </CardContent>
      </Card>

      {posts.length > 0 && (
        <div className='border-border rounded-lg border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Slugs</TableHead>
                <TableHead className='w-0' />
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map(post => {
                const es = post.post_translations.find(t => t.locale === 'es')
                const en = post.post_translations.find(t => t.locale === 'en')

                return (
                  <TableRow key={post.key}>
                    <TableCell className='font-medium'>
                      {es?.title ?? post.key}
                      <span className='text-muted-foreground block text-xs font-normal'>{post.key}</span>
                    </TableCell>
                    <TableCell>
                      {/* Un estado por idioma: la traducción puede seguir en
                          borrador mientras el original ya salió. */}
                      <div className='flex gap-1'>
                        {(['es', 'en'] as const).map(locale => {
                          const t = post.post_translations.find(row => row.locale === locale)

                          return (
                            <Badge
                              key={locale}
                              variant={t?.status === 'published' ? 'default' : 'secondary'}
                            >
                              {locale.toUpperCase()} {t?.status === 'published' ? '✓' : '·'}
                            </Badge>
                          )
                        })}
                      </div>
                    </TableCell>
                    <TableCell className='text-muted-foreground font-mono text-xs'>
                      <span className='block'>es / {es?.slug ?? '—'}</span>
                      <span className='block'>en / {en?.slug ?? '—'}</span>
                    </TableCell>
                    <TableCell>
                      <Button variant='outline' size='sm' render={<Link href={`/admin/posts/${post.key}`} />}>
                        Editar
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

export default AdminPostsPage
