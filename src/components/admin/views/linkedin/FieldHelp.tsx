'use client'

// Third-party Imports
import { Info } from 'lucide-react'

// Component Imports
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/admin/ui/tooltip'

/**
 * La ayuda de un campo, detrás de un ícono.
 *
 * El diálogo de programar tiene cuatro campos y cada uno arrastraba dos o tres
 * renglones de explicación: junto era más texto que formulario, y lo que se lee
 * todos los días —la fecha y el texto— quedaba enterrado entre cosas que se leen
 * una sola vez. Acá el detalle sigue estando, pero sólo cuando se lo busca.
 *
 * Va como `button` con `type='button'`: dentro de un `form` un botón sin tipo es
 * un submit, y pedir ayuda mandaría el formulario.
 */
const FieldHelp = ({ children, label }: { children: React.ReactNode; label: string }) => (
  <Tooltip>
    <TooltipTrigger
      render={
        <button
          type='button'
          aria-label={`Ayuda: ${label}`}
          className='text-muted-foreground hover:text-foreground focus-visible:ring-ring inline-flex rounded-full transition-colors focus-visible:ring-2 focus-visible:outline-none'
        />
      }
    >
      <Info className='size-3.5' />
    </TooltipTrigger>
    {/* Más ancho que el default: son explicaciones de un par de renglones, no
        etiquetas de un ícono de barra de herramientas. */}
    <TooltipContent className='max-w-xs leading-relaxed'>{children}</TooltipContent>
  </Tooltip>
)

export default FieldHelp
