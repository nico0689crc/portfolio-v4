'use client'

/**
 * Cómo se ve el artículo en un resultado de Google.
 *
 * No es decoración: el título y la descripción se escriben a ciegas y el corte
 * a ~60 y ~155 caracteres no se intuye contando letras. Ver la frase cortada es
 * lo que hace que alguien la reescriba.
 *
 * Los límites son aproximados a propósito — Google mide en píxeles, no en
 * caracteres, y promete cualquier cosa según el dispositivo. Sirven como señal,
 * no como validación, y por eso no bloquean el guardado.
 */
const TITLE_LIMIT = 60
const DESCRIPTION_LIMIT = 155

const clamp = (value: string, limit: number) =>
  value.length > limit ? `${value.slice(0, limit - 1).trimEnd()}…` : value

const SerpPreview = ({
  title,
  description,
  url
}: {
  title: string
  description: string
  url: string
}) => (
  <div className='border-border rounded-lg border p-4'>
    <p className='text-muted-foreground mb-2 text-xs font-semibold tracking-widest uppercase'>
      En Google
    </p>
    <div className='max-w-xl'>
      <p className='text-muted-foreground truncate text-xs'>{url}</p>
      <p className='text-[#1a0dab] text-lg leading-snug dark:text-[#8ab4f8]'>
        {clamp(title || 'Sin título', TITLE_LIMIT)}
      </p>
      <p className='text-muted-foreground text-sm'>
        {clamp(description || 'Sin descripción.', DESCRIPTION_LIMIT)}
      </p>
    </div>
  </div>
)

export { DESCRIPTION_LIMIT, TITLE_LIMIT }
export default SerpPreview
