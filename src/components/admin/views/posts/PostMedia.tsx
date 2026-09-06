'use client'

// React Imports
import { useActionState, useEffect } from 'react'

// Next Imports
import Image from 'next/image'

// Third-party Imports
import { toast } from 'sonner'
import { Upload } from 'lucide-react'

// Component Imports
import { Button } from '@/components/admin/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/admin/ui/card'
import { Field, FieldDescription, FieldLabel } from '@/components/admin/ui/field'
import { Input } from '@/components/admin/ui/input'

// Lib Imports
import { uploadCover, type MediaFormState } from '@/lib/admin/post-media-actions'
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
  useEffect(() => {
    if (coverState.saved) toast.success('Portada actualizada')
    if (coverState.error) toast.error(coverState.error)
  }, [coverState])

  return (
    <div>
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

    </div>
  )
}

export default PostMedia
