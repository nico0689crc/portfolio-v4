// Next Imports
import Link from 'next/link'

// Component Imports
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/admin/ui/card'

// Lib Imports
import { createSupabaseServerClient } from '@/lib/supabase/server'

// Los contadores usan `head: true`: Supabase devuelve sólo el total en un header
// y ninguna fila, así que el resumen no baja el contenido entero para contarlo.
const countOf = async (
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  table: 'projects' | 'posts' | 'contact_messages' | 'tags'
) => {
  const { count } = await supabase.from(table).select('*', { count: 'exact', head: true })

  return count ?? 0
}

const AdminHomePage = async () => {
  const supabase = await createSupabaseServerClient()

  const [projects, posts, messages, tags] = await Promise.all([
    countOf(supabase, 'projects'),
    countOf(supabase, 'posts'),
    countOf(supabase, 'contact_messages'),
    countOf(supabase, 'tags')
  ])

  const cards = [
    { label: 'Proyectos', value: projects, href: '/admin/proyectos' },
    { label: 'Posts', value: posts, href: '/admin/posts' },
    { label: 'Mensajes', value: messages, href: '/admin/mensajes' },
    { label: 'Tags', value: tags, href: '/admin/tags' }
  ]

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-semibold'>Resumen</h1>
        <p className='text-muted-foreground text-sm'>Estado del contenido del portafolio.</p>
      </div>

      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {cards.map(card => (
          <Link key={card.href} href={card.href}>
            <Card className='hover:border-primary/40 h-full transition-colors'>
              <CardHeader>
                <CardDescription>{card.label}</CardDescription>
                <CardTitle className='text-3xl tabular-nums'>{card.value}</CardTitle>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default AdminHomePage
