'use client'

// React Imports
import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'

// Type Imports
import type { AdminUser } from '@/lib/admin/auth'

// El usuario se resuelve una sola vez, en el layout servidor que corre el guard.
// El contexto sólo lo baja hasta el header, que es cliente; así el panel no
// vuelve a pegarle a Supabase desde el browser para saber quién está logueado.
const AdminUserContext = createContext<AdminUser | null>(null)

export const AdminUserProvider = ({ user, children }: { user: AdminUser; children: ReactNode }) => (
  <AdminUserContext.Provider value={user}>{children}</AdminUserContext.Provider>
)

export const useAdminUser = () => {
  const user = useContext(AdminUserContext)

  if (!user) throw new Error('useAdminUser debe usarse dentro de <AdminUserProvider>')

  return user
}
