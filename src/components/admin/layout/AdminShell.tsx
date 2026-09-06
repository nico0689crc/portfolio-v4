'use client'

// React Imports
import { Suspense } from 'react'
import type { ReactNode } from 'react'

// Component Imports
import Footer from '@/components/admin/layout/Footer'
import Header from '@/components/admin/layout/Header'
import ScrollToTop from '@/components/admin/layout/ScrollToTop'
import Sidebar from '@/components/admin/layout/Sidebar'
import { SidebarInset } from '@/components/admin/ui/sidebar'
import { Toaster } from '@/components/admin/ui/sonner'

// El Sidebar lee useSearchParams para resolver el item activo, así que necesita
// el Suspense: sin él, Next fuerza el render dinámico de todo el árbol.
const AdminShell = ({ children }: Readonly<{ children: ReactNode }>) => {
  return (
    <div className='flex h-full w-full min-w-0'>
      <Suspense>
        <Sidebar />
      </Suspense>
      <SidebarInset className='flex flex-1 flex-col'>
        <Header />
        <main className='mx-auto size-full max-w-360 flex-1 px-4 py-6 sm:px-6'>{children}</main>
        <Toaster />
        <Footer />
      </SidebarInset>
      <ScrollToTop />
    </div>
  )
}

export default AdminShell
