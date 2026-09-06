// React Imports
import type { ReactNode } from 'react'

// Component Imports
import BlankLayout from '@/components/admin/layout/BlankLayout'

// Las pantallas de sesión van sin sidebar ni header: no hay usuario todavía.
const AdminAuthLayout = ({ children }: { children: ReactNode }) => {
  return <BlankLayout>{children}</BlankLayout>
}

export default AdminAuthLayout
