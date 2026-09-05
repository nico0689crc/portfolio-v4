// Component Imports
import RedirectsEditor, { type RedirectRow } from '@/components/admin/views/redirects/RedirectsEditor'

// Lib Imports
import { createSupabaseServerClient } from '@/lib/supabase/server'

export const metadata = { title: 'Redirecciones' }

const AdminRedirectsPage = async () => {
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase.from('redirects').select('from_path, to_path, permanent').order('from_path')

  const rows: RedirectRow[] = (data ?? []).map(row => ({
    fromPath: row.from_path,
    toPath: row.to_path,
    permanent: row.permanent
  }))

  return (
    <div className='flex flex-col gap-6'>
      <div>
        <h1 className='text-2xl font-semibold tracking-tight'>Redirecciones</h1>
        <p className='text-muted-foreground text-sm'>
          Rutas viejas que tienen que seguir resolviendo.
        </p>
      </div>

      <RedirectsEditor initialRows={rows} />
    </div>
  )
}

export default AdminRedirectsPage
