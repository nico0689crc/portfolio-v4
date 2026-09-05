// React Imports
import type { ReactNode } from 'react'

// Next Imports
import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'

// Third-party Imports
import { NuqsAdapter } from 'nuqs/adapters/next/app'

// Util Imports
import { cn } from '@/lib/utils'

// Style Imports
import './admin.css'

// Root layout propio del backoffice. Next admite varios root layouts mientras no
// exista src/app/layout.tsx: éste y el de [locale] son hermanos y no comparten
// ni `<html>` ni hoja de estilos, que es justamente lo que mantiene la tipografía
// del sitio público fuera del panel.

const inter = Inter({
  variable: '--font-admin-sans',
  subsets: ['latin']
})

const jetBrainsMono = JetBrains_Mono({
  variable: '--font-admin-mono',
  subsets: ['latin']
})

export const metadata: Metadata = {
  title: 'Panel · Portafolio',
  // El backoffice nunca debe aparecer en un buscador, ni siquiera la pantalla de login.
  robots: { index: false, follow: false }
}

const AdminRootLayout = ({ children }: Readonly<{ children: ReactNode }>) => {
  return (
    <html
      lang='es'
      className={cn(inter.variable, jetBrainsMono.variable, 'flex min-h-full w-full antialiased')}
      data-scroll-behavior='smooth'
      suppressHydrationWarning
    >
      <body className='flex min-h-full w-full flex-auto flex-col'>
        <NuqsAdapter>{children}</NuqsAdapter>
      </body>
    </html>
  )
}

export default AdminRootLayout
