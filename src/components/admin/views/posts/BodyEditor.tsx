'use client'

// React Imports
import { useActionState, useEffect, useRef, useState } from 'react'

// Third-party Imports
import { toast } from 'sonner'
import {
  Bold,
  Code,
  Eye,
  Heading2,
  Image as ImageIcon,
  Italic,
  Link2,
  List,
  Pencil,
  Quote
} from 'lucide-react'

// Component Imports
import { Button } from '@/components/admin/ui/button'
import PostBody from '@/components/pages/blog/PostBody'

// Lib Imports
import { uploadBodyImage, type MediaFormState } from '@/lib/admin/post-media-actions'

type Wrap = { before: string; after?: string; placeholder: string }

/**
 * Cada botón describe qué envuelve, no cómo se aplica.
 *
 * La alternativa —una función por botón— repetía la misma lógica de selección
 * siete veces, y es donde se cuela el que no restaura el cursor.
 */
const ACTIONS: { icon: typeof Bold; label: string; wrap: Wrap }[] = [
  { icon: Heading2, label: 'Subtítulo', wrap: { before: '## ', placeholder: 'Subtítulo' } },
  { icon: Bold, label: 'Negrita', wrap: { before: '**', after: '**', placeholder: 'texto' } },
  { icon: Italic, label: 'Cursiva', wrap: { before: '*', after: '*', placeholder: 'texto' } },
  { icon: Link2, label: 'Enlace', wrap: { before: '[', after: '](https://)', placeholder: 'texto' } },
  { icon: List, label: 'Lista', wrap: { before: '- ', placeholder: 'ítem' } },
  { icon: Quote, label: 'Cita', wrap: { before: '> ', placeholder: 'cita' } },
  { icon: Code, label: 'Código', wrap: { before: '`', after: '`', placeholder: 'código' } }
]

const EMPTY: MediaFormState = { error: null, snippet: null, saved: false }

const BodyEditor = ({
  postKey,
  name,
  defaultValue
}: {
  /** Null mientras el artículo no existe: no hay dónde guardar el archivo. */
  postKey: string | null
  name: string
  defaultValue: string
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [value, setValue] = useState(defaultValue)
  const [preview, setPreview] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const [uploadState, uploadAction, isUploading] = useActionState(
    uploadBodyImage.bind(null, postKey ?? ''),
    EMPTY
  )

  /** Inserta en la posición del cursor y deja seleccionado lo que hay que escribir. */
  const applyWrap = ({ before, after = '', placeholder }: Wrap) => {
    const el = textareaRef.current

    if (!el) return

    const { selectionStart: start, selectionEnd: end } = el
    const selected = value.slice(start, end) || placeholder
    const next = `${value.slice(0, start)}${before}${selected}${after}${value.slice(end)}`

    setValue(next)

    // El foco vuelve al textarea después del render: sin esto el editor tiene
    // que hacer clic otra vez para seguir escribiendo, en cada botón.
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(start + before.length, start + before.length + selected.length)
    })
  }

  useEffect(() => {
    if (uploadState.error) toast.error(uploadState.error)
    if (!uploadState.snippet) return

    // Se inserta en el cursor en vez de copiarse al portapapeles: pegar a mano
    // es un paso más y termina con la imagen en el medio de un párrafo.
    const el = textareaRef.current
    const at = el?.selectionStart ?? value.length

    setValue(current => `${current.slice(0, at)}\n\n${uploadState.snippet}\n\n${current.slice(at)}`)
    toast.success('Imagen insertada. Escribí el texto alternativo.')

    if (fileRef.current) fileRef.current.value = ''
    // `value` queda fuera a propósito: sólo tiene que correr cuando llega un
    // snippet nuevo, no en cada tecla.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadState])

  const words = value.trim().split(/\s+/).filter(Boolean).length

  return (
    <div className='flex flex-col gap-2'>
      <div className='flex flex-wrap items-center gap-1'>
        {ACTIONS.map(action => (
          <Button
            key={action.label}
            type='button'
            variant='ghost'
            size='icon'
            aria-label={action.label}
            title={action.label}
            disabled={preview}
            onClick={() => applyWrap(action.wrap)}
          >
            <action.icon className='size-4' />
          </Button>
        ))}

        <span className='bg-border mx-1 h-5 w-px' aria-hidden />

        <Button
          type='button'
          variant='ghost'
          size='icon'
          aria-label='Insertar imagen'
          title={postKey ? 'Insertar imagen' : 'Disponible después de crear el artículo'}
          disabled={preview || isUploading || !postKey}
          onClick={() => fileRef.current?.click()}
        >
          <ImageIcon className='size-4' />
        </Button>

        <span className='ml-auto flex items-center gap-3'>
          <span className='text-muted-foreground text-xs'>
            {words} {words === 1 ? 'palabra' : 'palabras'} · ~{Math.max(1, Math.round(words / 200))} min
          </span>
          <Button type='button' variant='outline' size='sm' onClick={() => setPreview(p => !p)}>
            {preview ? <Pencil className='size-4' /> : <Eye className='size-4' />}
            {preview ? 'Editar' : 'Previsualizar'}
          </Button>
        </span>
      </div>

      {/* El formulario de subida es hermano y no anidado: un <form> dentro de
          otro es HTML inválido y el navegador lo desarma en silencio. */}
      <form action={uploadAction} className='hidden'>
        <input
          ref={fileRef}
          type='file'
          name='file'
          accept='image/png,image/jpeg,image/webp,image/avif'
          onChange={event => event.currentTarget.form?.requestSubmit()}
        />
      </form>

      {preview ? (
        <div className='border-border min-h-64 rounded-md border p-6'>
          {value.trim() ? (
            <PostBody body={value} />
          ) : (
            <p className='text-muted-foreground text-sm'>Nada que previsualizar todavía.</p>
          )}
        </div>
      ) : (
        <textarea
          ref={textareaRef}
          id={name}
          name={name}
          value={value}
          onChange={event => setValue(event.target.value)}
          rows={20}
          spellCheck
          className='border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-md border px-3 py-2 font-mono text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-3'
        />
      )}
    </div>
  )
}

export default BodyEditor
