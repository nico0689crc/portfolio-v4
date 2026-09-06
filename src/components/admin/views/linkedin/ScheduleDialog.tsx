'use client'

// React Imports
import { useState, useTransition } from 'react'

// Third-party Imports
import { toast } from 'sonner'

// Component Imports
import { Button } from '@/components/admin/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/admin/ui/dialog'
import { Field, FieldDescription, FieldLabel } from '@/components/admin/ui/field'
import { Input } from '@/components/admin/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/admin/ui/select'
import { Switch } from '@/components/admin/ui/switch'
import { Textarea } from '@/components/admin/ui/textarea'

// Lib Imports
import { scheduleShare, updateShare } from '@/lib/admin/social-actions'

/** El orden es el del select, y el primero es el default de un envío nuevo. */
const MEDIA_OPTIONS = [
  { value: 'article', label: 'Tarjeta de enlace' },
  { value: 'auto', label: 'Portada del artículo' },
  { value: 'document', label: 'Carrusel (PDF)' },
  { value: 'none', label: 'Sin imagen' }
]

/** `+03:00` / `-03:00` para la fecha dada, en el huso del navegador. */
const offsetOf = (date: Date) => {
  const minutes = -date.getTimezoneOffset()
  const sign = minutes < 0 ? '-' : '+'
  const abs = Math.abs(minutes)

  return `${sign}${String(Math.floor(abs / 60)).padStart(2, '0')}:${String(abs % 60).padStart(2, '0')}`
}

/**
 * El diálogo de programar, que también sirve para editar.
 *
 * Llega con la fecha y el texto ya resueltos por el server: el flujo pensado es
 * abrir, mirar, confirmar. Programar cincuenta notas de a una tiene que costar
 * un clic cada una, no elegir fecha cincuenta veces.
 */
const ScheduleDialog = ({
  postId,
  shareId,
  title,
  defaultScheduledAt,
  defaultMessage,
  autoMessage,
  defaultMedia,
  defaultLinkInFirstComment,
  currentDocument,
  hasCover,
  triggerLabel,
  triggerVariant = 'outline'
}: {
  postId: string
  shareId?: string
  title: string
  /** Ya viene en formato `datetime-local`, en la hora que el editor espera ver. */
  defaultScheduledAt: string
  defaultMessage: string
  /** El texto que saldría si el campo queda vacío. Se muestra como placeholder. */
  autoMessage: string
  defaultMedia: 'auto' | 'article' | 'document' | 'none'
  defaultLinkInFirstComment: boolean
  /** Nombre del PDF ya cargado, si lo hay: evita tener que volver a subirlo al editar. */
  currentDocument: string | null
  /** Sin portada no hay miniatura, y Buffer la exige para un documento. */
  hasCover: boolean
  triggerLabel: React.ReactNode
  triggerVariant?: 'outline' | 'ghost'
}) => {
  const [open, setOpen] = useState(false)
  const [media, setMedia] = useState(defaultMedia)
  const [linkInComment, setLinkInComment] = useState(defaultLinkInFirstComment)
  const [isPending, startTransition] = useTransition()
  const editing = shareId !== undefined

  // Con tarjeta el link es la tarjeta, así que el switch ni se ofrece y lo
  // guardado deja de aplicar. Vale la pena calcularlo una vez: de acá salen
  // tanto el texto que se arma solo como lo que el copy promete.
  const linkGoesToComment = linkInComment && media !== 'article'

  // El envío va por `useTransition` y no por `useActionState` para poder cerrar
  // el diálogo en el callback: con el estado del action habría que cerrarlo
  // desde un efecto, que es una cascada de renders y no hace falta.
  const submit = (formData: FormData) =>
    startTransition(async () => {
      const { error } = editing ? await updateShare(formData) : await scheduleShare(formData)

      if (error) {
        toast.error(error)

        return
      }

      toast.success(editing ? 'Envío actualizado' : 'Programado')
      setOpen(false)
    })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* El disparador va afuera del Dialog y la apertura se maneja con estado,
          igual que en `PostRowActions`. */}
      <Button variant={triggerVariant} size='sm' onClick={() => setOpen(true)}>
        {triggerLabel}
      </Button>

      <DialogContent className='sm:max-w-lg'>
        <form action={submit}>
          <DialogHeader>
            <DialogTitle className='truncate'>{title}</DialogTitle>
            <DialogDescription>
              Se entrega a Buffer hasta 48 h antes y LinkedIn lo publica a la hora exacta.
            </DialogDescription>
          </DialogHeader>

          <div className='flex flex-col gap-4 py-4'>
            {shareId && <input type='hidden' name='id' value={shareId} />}
            <input type='hidden' name='post_id' value={postId} />
            {/* El offset del navegador viaja con el formulario: sin esto el
                server interpretaría «09:00» en UTC y el posteo saldría a las 6. */}
            <input type='hidden' name='tz_offset' value={offsetOf(new Date())} />

            <Field>
              <FieldLabel htmlFor={`scheduled_at-${shareId ?? postId}`}>Fecha y hora</FieldLabel>
              <Input
                id={`scheduled_at-${shareId ?? postId}`}
                name='scheduled_at'
                type='datetime-local'
                defaultValue={defaultScheduledAt}
                required
              />
              <FieldDescription>Sugerida por la cadencia. Cambiala si querés otro turno.</FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor={`media-${shareId ?? postId}`}>Media</FieldLabel>
              <Select
                name='media'
                value={media}
                onValueChange={value => setMedia(value as typeof media)}
                items={MEDIA_OPTIONS}
              >
                <SelectTrigger id={`media-${shareId ?? postId}`} className='w-full'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MEDIA_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldDescription>
                {media === 'auto'
                  ? 'Se adjunta la portada vigente al entregar, no la de hoy.'
                  : media === 'article'
                    ? 'Tarjeta clickeable al pie, con portada, título y bajada; el link queda además escrito en el texto. La API no scrapea la URL, así que la tarjeta se arma acá: sin esto un link suelto no genera preview.'
                    : media === 'document'
                      ? 'El carrusel de LinkedIn es un PDF de varias páginas: el multi-imagen nativo ya no existe.'
                      : 'Texto solo, sin nada adjunto.'}
              </FieldDescription>
            </Field>

            {media === 'document' && (
              <Field>
                <FieldLabel htmlFor={`document-${shareId ?? postId}`}>PDF del carrusel</FieldLabel>
                <Input
                  id={`document-${shareId ?? postId}`}
                  name='document'
                  type='file'
                  accept='application/pdf'
                />
                <FieldDescription>
                  {currentDocument
                    ? `Cargado: ${currentDocument}. Subí otro sólo si querés reemplazarlo.`
                    : 'Hasta 2 MB. Diseñá cada página en 1080×1080 o 1920×1080.'}
                  {!hasCover && ' Falta la portada del artículo, que es la miniatura del documento.'}
                </FieldDescription>
              </Field>
            )}

            {/* Con tarjeta el link ya es la tarjeta: ofrecer además mandarlo
                al comentario sería ofrecer duplicarlo. */}
            {media !== 'article' && (
              <Field orientation='horizontal'>
                <Switch
                  id={`link_in_first_comment-${shareId ?? postId}`}
                  name='link_in_first_comment'
                  checked={linkInComment}
                  onCheckedChange={setLinkInComment}
                />
                <FieldLabel htmlFor={`link_in_first_comment-${shareId ?? postId}`}>
                  Link en el primer comentario
                </FieldLabel>
              </Field>
            )}

            <Field>
              <FieldLabel htmlFor={`message-${shareId ?? postId}`}>Texto del posteo</FieldLabel>
              <Textarea
                id={`message-${shareId ?? postId}`}
                name='message'
                rows={8}
                defaultValue={defaultMessage}
                placeholder={autoMessage}
              />
              {/* Dos ideas, y en este orden: qué pasa si no escribís nada —que
                  es lo que hace el 90% de las veces— y qué perdés si escribís. */}
              <FieldDescription>
                Dejalo vacío y sale lo que ves en gris: título, bajada
                {linkGoesToComment ? ' y el link como primer comentario.' : ' y el link con UTMs.'}{' '}
                Se arma al entregar, así que una corrección de título hecha antes del turno igual
                sale. Si escribís acá, ese texto queda fijo y ya no se actualiza solo.
              </FieldDescription>
            </Field>
          </div>

          <DialogFooter>
            <DialogClose render={<Button type='button' variant='outline' />}>Cancelar</DialogClose>
            <Button type='submit' disabled={isPending}>
              {isPending ? 'Guardando…' : editing ? 'Guardar' : 'Programar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default ScheduleDialog
