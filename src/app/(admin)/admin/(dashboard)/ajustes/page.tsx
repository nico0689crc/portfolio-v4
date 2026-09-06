// Component Imports
import SettingsForm, { type SettingsValues } from '@/components/admin/views/settings/SettingsForm'

// Lib Imports
import { createSupabaseServerClient } from '@/lib/supabase/server'

export const metadata = { title: 'Ajustes' }

const AdminSettingsPage = async () => {
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase.from('settings').select('key, value')

  const byKey = Object.fromEntries((data ?? []).map(row => [row.key, row.value]))

  // Cada clave puede no existir todavía: el formulario tiene que poder crear la
  // fila, no sólo editarla.
  const values: SettingsValues = {
    contactEmail: typeof byKey.contact_email === 'string' ? byKey.contact_email : '',
    socialLinks: Array.isArray(byKey.social_links) ? (byKey.social_links as string[]) : [],
    cvFiles: {
      es: (byKey.cv_files as Record<string, string> | null)?.es ?? '',
      en: (byKey.cv_files as Record<string, string> | null)?.en ?? ''
    }
  }

  return (
    <div className='flex flex-col gap-6'>
      <div>
        <h1 className='text-2xl font-semibold tracking-tight'>Ajustes</h1>
        <p className='text-muted-foreground text-sm'>
          Valores sueltos que usan la home, el footer, el CV y el structured data.
        </p>
      </div>

      <SettingsForm values={values} />
    </div>
  )
}

export default AdminSettingsPage
