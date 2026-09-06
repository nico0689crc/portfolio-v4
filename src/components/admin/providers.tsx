// React Imports
import type { ReactNode } from 'react'

// Component Imports
import { ThemeProvider } from './theme-provider'
import { AdminUserProvider } from '@/components/admin/admin-user-context'
import { SidebarProvider } from '@/components/admin/ui/sidebar'
import { TooltipProvider } from '@/components/admin/ui/tooltip'

// Type Imports
import type { AdminUser } from '@/lib/admin/auth'

type Props = {
  children: ReactNode
  user: AdminUser
  sidebarDefaultOpen?: boolean
}

const Providers = ({ children, user, sidebarDefaultOpen }: Props) => {
  return (
    <ThemeProvider attribute='class' defaultTheme='system' enableSystem={true}>
      <AdminUserProvider user={user}>
        <TooltipProvider>
          <SidebarProvider defaultOpen={sidebarDefaultOpen}>{children}</SidebarProvider>
        </TooltipProvider>
      </AdminUserProvider>
    </ThemeProvider>
  )
}

export default Providers
