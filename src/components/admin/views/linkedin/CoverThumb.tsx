// Next Imports
import Image from 'next/image'

// Third-party Imports
import { ImageOff } from 'lucide-react'

/**
 * La portada del artículo, al principio de cada fila.
 *
 * El hueco tachado no es un placeholder cualquiera: sin portada tampoco hay
 * miniatura para el carrusel en PDF, que Buffer exige, así que la ausencia es
 * un dato y no un vacío que rellenar con gris.
 *
 * Sin `'use client'` a propósito: lo usan la agenda, que se renderiza en el
 * server, y las dos listas de cliente. No tiene estado ni dependencias de
 * server, así que sirve en los dos lados sin duplicarlo.
 */
const CoverThumb = ({ url }: { url: string | null }) => (
  <div className='bg-muted relative size-11 shrink-0 overflow-hidden rounded-md'>
    {url ? (
      <Image src={url} alt='' fill sizes='44px' className='object-cover' />
    ) : (
      <ImageOff
        className='text-muted-foreground/60 absolute top-1/2 left-1/2 size-4 -translate-x-1/2 -translate-y-1/2'
        aria-label='Sin portada'
      />
    )}
  </div>
)

export default CoverThumb
