'use client'

// React Imports
import { useActionState, useEffect } from 'react'

// Next Imports
import Image from 'next/image'

// Third-party Imports
import { toast } from 'sonner'
import { Copy, Upload } from 'lucide-react'

// Component Imports
import { Button } from '@/components/admin/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/admin/ui/card'
import { Field, FieldDescription, FieldLabel } from '@/components/admin/ui/field'
import { Input } from '@/components/admin/ui/input'

// Lib Imports
import { uploadBodyImage, uploadCover, type MediaFormState } from '@/lib/admin/post-media-actions'
import { BUCKETS, storageUrl } from '@/lib/content/storage'

const EMPTY: MediaFormState = { error: null, snippet: null, saved: false }

const PostMedia = ({
  postKey,
  cover
}: {
  postKey: string
  cover: { path: string; width: number; height: number } | null
}) => {
  const [coverState, coverAction, isUploadingCover] = useActionState(uploadCover.bind(null, postKey), EMPTY)
  const [bodyState, bodyAction, isUploadingBody] = useActionState(
    uploadBodyImage.bind(null, postKey),
    EMPTY
  )

  // El snippet se deriva del estado de la acción en vez de copiarse a un
  // useState: guardarlo obligaba a sincronizar dos fuentes de la misma verdad
  // dentro de un efecto, que es exactamente lo que provoca renders en cascada.
  const snippet = bodyState.snippet

  useEffect(() => {
    if (coverState.saved) toast.success('Portada actualizada')
    if (coverState.error) toast.error(coverState.error)
  }, [coverState])

  useEffect(() => {
    if (bodyState.error) toast.error(bodyState.error)
  }, [bodyState])

  const copy = async () => {
    if (!snippet) return

    try {
      await navigator.clipboard.writeText(snippet)
      toast.success('Copiado')
    } catch {
      // Sin permiso de portapapeles el texto sigue visible y seleccionable, así
      // que el fallo no deja al editor sin salida.
      toast.error('No se pudo copiar. Seleccionalo a mano.')
    }
  }

  return (
    <div className='grid gap-6 lg:grid-cols-2'>
      <Card>
        <CardHeader>
          <CardTitle>Portada</CardTitle>
        </CardHeader>
        <CardContent className='flex flex-col gap-4'>
          {cover ? (
            <div className='bg-muted relative aspect-video overflow-hidden rounded-md'>
              <Image
                src={storageUrl(cover.path, BUCKETS.postMedia)}
                alt=''
                fill
                sizes='400px'
                className='object-cover'
              />
            </div>
          ) : (
            <p className='text-muted-foreground rounded-md border border-dashed p-6 text-center text-sm'>
              Sin portada. También es la imagen que se ve al compartir el link.
            </p>
          )}

          <form action={coverAction} className='flex flex-wrap items-end gap-3'>
            <Field className='flex-1'>
              <FieldLabel htmlFor='cover'>Reemplazar</FieldLabel>
              <Input id='cover' name='file' type='file' accept='image/png,image/jpeg,image/webp,image/avif' />
              <FieldDescription>
                {cover ? `${cover.width}×${cover.height} actual. ` : ''}Ideal 1200×630 para redes.
              </FieldDescription>
            </Field>
            <Button type='submit' disabled={isUploadingCover}>
              <Upload className='size-4' /> {isUploadingCover ? 'Subiendo…' : 'Subir'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Imagen para el cuerpo</CardTitle>
        </CardHeader>
        <CardContent className='flex flex-col gap-4'>
          <form action={bodyAction} className='flex flex-wrap items-end gap-3'>
            <Field className='flex-1'>
              <FieldLabel htmlFor='bodyImage'>Archivo</FieldLabel>
              <Input
                id='bodyImage'
                name='file'
                type='file'
                accept='image/png,image/jpeg,image/webp,image/avif'
              />
              <FieldDescription>Se sube y te devuelve el markdown para pegar.</FieldDescription>
            </Field>
            <Button type='submit' variant='outline' disabled={isUploadingBody}>
              <Upload className='size-4' /> {isUploadingBody ? 'Subiendo…' : 'Subir'}
            </Button>
          </form>

          {snippet && (
            <div className='flex flex-col gap-2'>
              <code className='bg-muted rounded-md p-3 text-xs break-all select-all'>{snippet}</code>
              <div className='flex items-center gap-2'>
                <Button type='button' size='sm' variant='outline' onClick={copy}>
                  <Copy className='size-4' /> Copiar
                </Button>
                <span className='text-muted-foreground text-xs'>
                  Escribí el texto alternativo entre los corchetes.
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default PostMedia
