// React Imports
import type { ReactNode } from 'react'

// Component Imports
import AdminShell from '@/components/admin/layout/AdminShell'
import Providers from '@/components/admin/providers'

// Lib Imports
import { requireAdmin } from '@/lib/admin/auth'

// Todo lo que cuelga de este layout está detrás del guard: alcanza con montarlo
// acá para que ninguna página del panel tenga que repetir el chequeo.
const AdminDashboardLayout = async ({ children }: Readonly<{ children: ReactNode }>) => {
  const user = await requireAdmin()

  return (
    <Providers sidebarDefaultOpen={true} user={user}>
      <AdminShell>{children}</AdminShell>
    </Providers>
  )
}

export default AdminDashboardLayout
