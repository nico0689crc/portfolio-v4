'use client'

// React Imports
import { Fragment } from 'react'

// Next Imports
import Link from 'next/link'
import { usePathname } from 'next/navigation'

// Component Imports
import ModeToggle from '@/components/admin/layout/ModeToggle'
import ProfileDropdown from '@/components/admin/shared/ProfileDropdown'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/admin/ui/breadcrumb'
import { Separator } from '@/components/admin/ui/separator'
import { SidebarTrigger } from '@/components/admin/ui/sidebar'

// El slug de una ruta no siempre es una etiqueta presentable: `curriculum` va sin
// acento en la URL y `seo` en minúscula quedaría "Seo". Lo que no está acá cae al
// title-case genérico.
const segmentLabels: Record<string, string> = {
  admin: 'Panel',
  curriculum: 'Currículum',
  seo: 'SEO',
  faqs: 'FAQs',
  educacion: 'Educación',
  redirecciones: 'Redirecciones'
}

const toLabel = (segment: string) =>
  segmentLabels[segment] ?? segment.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

const Header = () => {
  const pathname = usePathname()

  const segments = pathname.split('/').filter(Boolean)

  return (
    <header className='bg-card sticky top-0 z-50 border-b'>
      <div className='mx-auto flex max-w-360 items-center justify-between gap-6 px-4 py-2 sm:px-6'>
        <div className='flex items-center gap-4'>
          <SidebarTrigger className='[&_svg]:size-5!' />
          <Separator orientation='vertical' className='hidden h-4! data-vertical:self-center sm:block' />
          <Breadcrumb className='hidden sm:block'>
            <BreadcrumbList>
              {segments.map((segment, index) => {
                const isLast = index === segments.length - 1
                const href = '/' + segments.slice(0, index + 1).join('/')

                return (
                  <Fragment key={href}>
                    <BreadcrumbItem>
                      {isLast ? (
                        <BreadcrumbPage>{toLabel(segment)}</BreadcrumbPage>
                      ) : (
                        // BreadcrumbLink es un <a> pelado y no acepta `render`. Se deja
                        // stock (el MCP regenera esta primitiva) y se usa Link con sus
                        // mismas clases, que además conserva la navegación cliente.
                        <Link href={href} className='hover:text-foreground transition-colors'>
                          {toLabel(segment)}
                        </Link>
                      )}
                    </BreadcrumbItem>
                    {!isLast && <BreadcrumbSeparator />}
                  </Fragment>
                )
              })}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className='flex items-center gap-1.5'>
          <ModeToggle />
          <ProfileDropdown />
        </div>
      </div>
    </header>
  )
}

export default Header
