'use client'

// React Imports
import { useState, useTransition } from 'react'

// Next Imports
import Link from 'next/link'

// Third-party Imports
import { toast } from 'sonner'
import { Archive, ArchiveRestore, ExternalLink, Eye, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/admin/ui/dropdown-menu'

// Lib Imports
import { deletePost, setPostArchived } from '@/lib/admin/posts-actions'

/**
 * Lo que se puede hacer con un artículo desde el listado.
 *
 * Va en un menú y no en una fila de cuatro botones: con la columna de acciones
 * ocupando un cuarto del ancho, el título —que es lo que se lee— quedaba
 * apretado, y «Eliminar» estaba a un clic distraído de «Archivar».
 */
const PostRowActions = ({
  postKey,
  title,
  archived,
  liveUrl,
  onChanged
}: {
  postKey: string
  title: string
  archived: boolean
  /** El artículo en el sitio, sólo si ya salió. Si todavía no, queda la vista previa. */
  liveUrl: string | null
  /** Avisa que la lista cambió. Archivar saca la fila del filtro en el que se la está mirando. */
  onChanged?: () => void
}) => {
  const [isPending, startTransition] = useTransition()
  const [confirmOpen, setConfirmOpen] = useState(false)

  const toggleArchive = () =>
    startTransition(async () => {
      const { error } = await setPostArchived(postKey, !archived)

      if (error) {
        toast.error(error)

        return
      }

      toast.success(archived ? 'Restaurado' : 'Archivado')
      onChanged?.()
    })

  const remove = () =>
    startTransition(async () => {
      // `deletePost` redirige al listado si todo sale bien, así que sólo se
      // vuelve de acá cuando falló.
      const { error } = await deletePost(postKey)

      if (error) toast.error(error)
    })

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant='ghost'
              size='icon'
              className='shrink-0'
              aria-label={`Acciones de «${title}»`}
            />
          }
        >
          <MoreHorizontal className='size-4' />
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-56'>
          <DropdownMenuItem render={<Link href={`/admin/posts/${postKey}`} />}>
            <Pencil />
            <span>Editar</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            render={<Link href={`/es/preview/blog/${postKey}`} target='_blank' />}
          >
            <Eye />
            <span>Vista previa</span>
          </DropdownMenuItem>

          {/* Sólo cuando el artículo ya salió: mientras la fecha sea futura la
              URL pública no resuelve y el ítem llevaría a un 404. */}
          {liveUrl && (
            <DropdownMenuItem
              render={<Link href={liveUrl} target='_blank' rel='noopener noreferrer' />}
            >
              <ExternalLink />
              <span>Ver en el sitio</span>
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          <DropdownMenuItem disabled={isPending} onClick={toggleArchive}>
            {archived ? <ArchiveRestore /> : <Archive />}
            <span>{archived ? 'Restaurar' : 'Archivar'}</span>
          </DropdownMenuItem>

          {/* Sólo el borrado pide confirmación: archivar se deshace con un clic
              y preguntar por todo entrena a la gente a decir que sí sin leer. */}
          <DropdownMenuItem
            variant='destructive'
            disabled={isPending}
            onClick={() => setConfirmOpen(true)}
          >
            <Trash2 />
            <span>Eliminar</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar «{title}»</DialogTitle>
            <DialogDescription>
              Se borran el artículo, sus dos traducciones y sus tags. No se puede deshacer. Si sólo
              querés sacarlo del sitio, archivalo.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant='outline' />}>Cancelar</DialogClose>
            <Button variant='destructive' disabled={isPending} onClick={remove}>
              {isPending ? 'Eliminando…' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default PostRowActions
