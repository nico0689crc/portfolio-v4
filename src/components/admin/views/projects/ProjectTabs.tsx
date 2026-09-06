'use client'

// Next Imports
import Link from 'next/link'
import { usePathname } from 'next/navigation'

// Component Imports
import { Button } from '@/components/admin/ui/button'

/**
 * Un proyecto se edita en tres pantallas porque son tres formularios distintos,
 * no tres pestañas de uno solo: guardar la prosa del caso no debería arrastrar
 * los datos ni las imágenes, y un único form de ese tamaño haría que un error
 * de validación en cualquier campo bloquee todo lo demás.
 */
const ProjectTabs = ({ projectKey }: { projectKey: string }) => {
  const pathname = usePathname()
  const base = `/admin/proyectos/${projectKey}`

  const tabs = [
    { href: base, label: 'Datos' },
    { href: `${base}/caso`, label: 'Caso de estudio' },
    { href: `${base}/imagenes`, label: 'Imágenes' }
  ]

  return (
    <div className='flex flex-wrap gap-2'>
      {tabs.map(tab => (
        <Button
          key={tab.href}
          variant={pathname === tab.href ? 'default' : 'outline'}
          size='sm'
          render={<Link href={tab.href} />}
        >
          {tab.label}
        </Button>
      ))}
    </div>
  )
}

export default ProjectTabs
