'use client'

// React Imports
import { useState, useTransition } from 'react'

// Next Imports
import Link from 'next/link'

// Third-party Imports
import { toast } from 'sonner'
import { Archive, ArchiveRestore, Eye, Pencil, Trash2 } from 'lucide-react'

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

// Lib Imports
import { deletePost, setPostArchived } from '@/lib/admin/posts-actions'

const PostRowActions = ({
  postKey,
  title,
  archived
}: {
  postKey: string
  title: string
  archived: boolean
}) => {
  const [isPending, startTransition] = useTransition()
  const [confirmOpen, setConfirmOpen] = useState(false)

  const toggleArchive = () =>
    startTransition(async () => {
      const { error } = await setPostArchived(postKey, !archived)

      if (error) toast.error(error)
      else toast.success(archived ? 'Restaurado' : 'Archivado')
    })

  const remove = () =>
    startTransition(async () => {
      // `deletePost` redirige al listado si todo sale bien, así que sólo se
      // vuelve de acá cuando falló.
      const { error } = await deletePost(postKey)

      if (error) toast.error(error)
    })

  return (
    <div className='flex items-center justify-end gap-1'>
      <Button variant='ghost' size='icon' aria-label='Vista previa' render={<Link href={`/es/preview/blog/${postKey}`} target='_blank' />}>
        <Eye className='size-4' />
      </Button>

      <Button variant='ghost' size='icon' aria-label='Editar' render={<Link href={`/admin/posts/${postKey}`} />}>
        <Pencil className='size-4' />
      </Button>

      <Button
        variant='ghost'
        size='icon'
        aria-label={archived ? 'Restaurar' : 'Archivar'}
        disabled={isPending}
        onClick={toggleArchive}
      >
        {archived ? <ArchiveRestore className='size-4' /> : <Archive className='size-4' />}
      </Button>

      {/* Sólo el borrado pide confirmación: archivar se deshace con un clic y
          preguntar por todo entrena a la gente a decir que sí sin leer. */}
      <Button
        variant='ghost'
        size='icon'
        aria-label='Eliminar'
        disabled={isPending}
        onClick={() => setConfirmOpen(true)}
      >
        <Trash2 className='text-destructive size-4' />
      </Button>

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
    </div>
  )
}

export default PostRowActions
