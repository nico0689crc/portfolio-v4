'use client'

// React Imports
import { useRef, useState, useTransition } from 'react'

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
import { Field, FieldLabel } from '@/components/admin/ui/field'
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
import FieldHelp from './FieldHelp'

// Lib Imports
import { scheduleShare, updateShare } from '@/lib/admin/social-actions'
import { MESSAGE_HARD_LIMIT, SLOT_TIMEZONE_OFFSET } from '@/lib/social/shares'

/** El orden es el del select, y el primero es el default de un envío nuevo. */
const MEDIA_OPTIONS = [
  { value: 'article', label: 'Tarjeta de enlace' },
  { value: 'auto', label: 'Portada del artículo' },
  { value: 'document', label: 'Carrusel (PDF)' },
  { value: 'none', label: 'Sin imagen' }
]

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
  triggerVariant = 'outline',
  open: controlledOpen,
  onOpenChange
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
  /** Sin esto el diálogo no dibuja disparador: lo abre quien lo controla desde afuera. */
  triggerLabel?: React.ReactNode
  triggerVariant?: 'outline' | 'ghost'
  /** Controlado desde afuera cuando el disparador es un ítem de menú, que se cierra al hacer clic. */
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) => {
  const [selfOpen, setSelfOpen] = useState(false)
  const open = controlledOpen ?? selfOpen
  const setOpen = onOpenChange ?? setSelfOpen
  const [media, setMedia] = useState(defaultMedia)
  const [linkInComment, setLinkInComment] = useState(defaultLinkInFirstComment)
  // Controlado porque el botón de «editar el texto» tiene que poder volcarle el
  // automático adentro, y el de «volver al automático» vaciarlo.
  const [message, setMessage] = useState(defaultMessage)
  const messageRef = useRef<HTMLTextAreaElement>(null)
  const [isPending, startTransition] = useTransition()
  const editing = shareId !== undefined

  // Adónde va el link, calculado igual que en `deliverShare`. De acá salen tanto
  // el placeholder como el copy: si se calculara distinto, el preview prometería
  // un texto que después no sale.
  const withCard = media === 'article'
  const linkGoesToComment = linkInComment && !withCard

  // Vacío es el modo automático: el texto se arma al entregar. Escrito —aunque
  // sea el automático con una palabra cambiada— queda fijo.
  const isCustom = message.trim() !== ''

  /**
   * Pasar del automático a un texto propio sin tener que reescribirlo.
   *
   * El placeholder muestra lo que va a salir pero no se puede tocar, y cambiar
   * una palabra obligaba a copiarlo a mano. Esto lo vuelca en el campo tal
   * cual: es el mismo `buildMessage` que usa la entrega, así que confirmar sin
   * tocar nada da el mismo posteo, sólo que ya congelado.
   */
  const editAutoMessage = () => {
    setMessage(autoMessage)

    // El foco al final, que es donde se escribe: abrir para retocar y quedar
    // parado en el carácter cero obliga a un clic más.
    requestAnimationFrame(() => {
      const node = messageRef.current

      if (!node) return

      node.focus()
      node.setSelectionRange(autoMessage.length, autoMessage.length)
    })
  }

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
      {triggerLabel !== undefined && (
        <Button variant={triggerVariant} size='sm' onClick={() => setOpen(true)}>
          {triggerLabel}
        </Button>
      )}

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
            {/* Sin esto el server interpretaría «11:00» en UTC y el posteo
                saldría a las 8. Va el offset de la agenda y no el del
                navegador: el campo ya muestra hora argentina, así que
                interpretarlo con otra zona lo correría de lugar si el editor
                abre el panel de viaje. */}
            <input type='hidden' name='tz_offset' value={SLOT_TIMEZONE_OFFSET} />

            <Field>
              <FieldLabel htmlFor={`scheduled_at-${shareId ?? postId}`}>
                Fecha y hora
                <FieldHelp label='Fecha y hora'>
                  Hora argentina. Sugerida por la cadencia; cambiala si querés otro turno.
                </FieldHelp>
              </FieldLabel>
              <Input
                id={`scheduled_at-${shareId ?? postId}`}
                name='scheduled_at'
                type='datetime-local'
                defaultValue={defaultScheduledAt}
                required
              />
            </Field>

            <Field>
              <FieldLabel htmlFor={`media-${shareId ?? postId}`}>
                Media
                <FieldHelp label='Media'>
                  {media === 'auto'
                    ? 'Se adjunta la portada vigente al entregar, no la de hoy.'
                    : media === 'article'
                      ? 'Tarjeta clickeable al pie, con portada, título y bajada; es la que lleva el link, sin ensuciar el texto. La API no scrapea la URL, así que la tarjeta se arma acá: sin esto un link suelto no genera preview.'
                      : media === 'document'
                        ? 'El carrusel de LinkedIn es un PDF de varias páginas: el multi-imagen nativo ya no existe.'
                        : 'Texto solo, sin nada adjunto.'}
                </FieldHelp>
              </FieldLabel>
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
            </Field>

            {media === 'document' && (
              <Field>
                <FieldLabel htmlFor={`document-${shareId ?? postId}`}>
                  PDF del carrusel
                  <FieldHelp label='PDF del carrusel'>
                    {currentDocument
                      ? `Cargado: ${currentDocument}. Subí otro sólo si querés reemplazarlo.`
                      : 'Hasta 2 MB. Diseñá cada página en 1080×1080 o 1920×1080.'}
                    {!hasCover && ' Falta la portada del artículo, que es la miniatura del documento.'}
                  </FieldHelp>
                </FieldLabel>
                <Input
                  id={`document-${shareId ?? postId}`}
                  name='document'
                  type='file'
                  accept='application/pdf'
                />
              </Field>
            )}

            {/* Con tarjeta el link ya es la tarjeta: ofrecer además mandarlo
                al comentario sería ofrecer duplicarlo. Igual se guarda lo
                elegido, para que cambiar de media más tarde no deje el link
                sin destino. */}
            {withCard && (
              <input type='hidden' name='link_in_first_comment' value={linkInComment ? 'on' : ''} />
            )}

            {!withCard && (
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
              <FieldLabel htmlFor={`message-${shareId ?? postId}`}>
                Texto del posteo
                {/* Tres ideas, y en este orden: qué pasa si no escribís nada
                    —que es lo que hace el 90% de las veces—, dónde queda el
                    link, y qué perdés si escribís. */}
                <FieldHelp label='Texto del posteo'>
                  Dejalo vacío y sale lo que ves en gris: título, bajada y el arranque de la
                  nota. La URL nunca va acá
                  {withCard
                    ? ': la lleva la tarjeta.'
                    : linkGoesToComment
                      ? ': va como primer comentario.'
                      : ', y así no sale en ningún lado.'}{' '}
                  Se arma al entregar, así que una corrección hecha antes del turno igual sale.
                  Si querés retocarlo, «Editar este texto» lo copia al campo para cambiar lo que
                  sea; desde ahí queda fijo y ya no se actualiza solo.
                </FieldHelp>
              </FieldLabel>
              {/* `field-sizing-content` lo hace crecer con el texto y el
                  automático pasa los 1000 caracteres: sin techo el campo
                  empujaba el pie del diálogo fuera de la pantalla. Mismo tope
                  que el detalle del historial. */}
              <Textarea
                id={`message-${shareId ?? postId}`}
                name='message'
                rows={8}
                className='max-h-64 overflow-y-auto'
                ref={messageRef}
                value={message}
                onChange={event => setMessage(event.target.value)}
                placeholder={autoMessage}
              />
              <div className='flex items-center justify-between gap-2'>
                {isCustom ? (
                  <Button type='button' variant='link' size='xs' className='px-0' onClick={() => setMessage('')}>
                    Volver al texto automático
                  </Button>
                ) : (
                  <Button type='button' variant='link' size='xs' className='px-0' onClick={editAutoMessage}>
                    Editar este texto
                  </Button>
                )}
                {isCustom && (
                  <span
                    className={
                      message.length > MESSAGE_HARD_LIMIT
                        ? 'text-destructive text-xs'
                        : 'text-muted-foreground text-xs'
                    }
                  >
                    {message.length}/{MESSAGE_HARD_LIMIT}
                  </span>
                )}
              </div>
              {!withCard && !linkGoesToComment && (
                <p className='text-xs text-amber-600 dark:text-amber-500'>
                  Así el link no sale en ningún lado: activá el primer comentario o elegí tarjeta
                  de enlace.
                </p>
              )}
            </Field>
          </div>

          <DialogFooter>
            <DialogClose render={<Button type='button' variant='outline' />}>Cancelar</DialogClose>
            <Button type='submit' disabled={isPending || message.length > MESSAGE_HARD_LIMIT}>
              {isPending ? 'Guardando…' : editing ? 'Guardar' : 'Programar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default ScheduleDialog
