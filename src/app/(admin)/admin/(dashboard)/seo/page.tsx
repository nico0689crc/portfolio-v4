// Component Imports
import SeoEditor, { type SeoRoute } from '@/components/admin/views/seo/SeoEditor'

// Lib Imports
import { createSupabaseServerClient } from '@/lib/supabase/server'

export const metadata = { title: 'SEO por página' }

const AdminSeoPage = async () => {
  const supabase = await createSupabaseServerClient()

  const { data } = await supabase
    .from('page_seo')
    .select('route_key, page_seo_translations(locale, title, description, og_image, noindex)')
    .order('sort_order')

  const routes: SeoRoute[] = (data ?? []).map(row => ({
    routeKey: row.route_key,
    translations: Object.fromEntries(
      row.page_seo_translations.map(t => [
        t.locale,
        {
          title: t.title ?? '',
          description: t.description ?? '',
          ogImage: t.og_image ?? '',
          noindex: t.noindex
        }
      ])
    )
  }))

  return (
    <div className='flex flex-col gap-6'>
      <div>
        <h1 className='text-2xl font-semibold tracking-tight'>SEO por página</h1>
        <p className='text-muted-foreground text-sm'>
          Título, descripción e imagen social de cada ruta fija. Los proyectos tienen los suyos en su propia
          pantalla.
        </p>
      </div>

      <SeoEditor routes={routes} />
    </div>
  )
}

export default AdminSeoPage
