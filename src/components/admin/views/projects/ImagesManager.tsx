'use client'

// React Imports
import { useActionState, useEffect, useState } from 'react'

// Next Imports
import Image from 'next/image'

// Third-party Imports
import { toast } from 'sonner'
import { ChevronLeft, ChevronRight, Trash2, Upload } from 'lucide-react'

// Component Imports
import { Button } from '@/components/admin/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/admin/ui/card'
import { Field, FieldDescription, FieldLabel } from '@/components/admin/ui/field'
import { Input } from '@/components/admin/ui/input'

// Lib Imports
import { saveImages, uploadImage, type ImagesFormState } from '@/lib/admin/images-actions'
import { storageUrl } from '@/lib/content/storage'

export type ProjectImageValues = {
  id: string
  storagePath: string
  width: number
  height: number
  alts: Record<string, string>
}

const LOCALES = ['es', 'en'] as const
const LOCALE_LABELS: Record<string, string> = { es: 'ES', en: 'EN' }

const ImagesManager = ({
  projectKey,
  initialImages
}: {
  projectKey: string
  initialImages: ProjectImageValues[]
}) => {
  const [images, setImages] = useState(initialImages)
  const [deleted, setDeleted] = useState<string[]>([])

  const [saveState, saveAction, isSaving] = useActionState<ImagesFormState, FormData>(
    saveImages.bind(null, projectKey),
    { error: null, saved: false }
  )

  const [uploadState, uploadAction, isUploading] = useActionState<ImagesFormState, FormData>(
    uploadImage.bind(null, projectKey),
    { error: null, saved: false }
  )

  useEffect(() => {
    if (saveState.saved) toast.success('Imágenes guardadas')
    if (saveState.error) toast.error(saveState.error)
  }, [saveState])

  useEffect(() => {
    if (uploadState.saved) toast.success('Imagen subida')
    if (uploadState.error) toast.error(uploadState.error)
  }, [uploadState])

  const move = (index: number, delta: number) =>
    setImages(current => {
      const next = [...current]
      const target = index + delta

      if (target < 0 || target >= next.length) return current
      ;[next[index], next[target]] = [next[target], next[index]]

      return next
    })

  const remove = (id: string) => {
    setImages(current => current.filter(image => image.id !== id))
    setDeleted(current => [...current, id])
  }

  return (
    <div className='flex flex-col gap-6'>
      {/* La subida va en su propio form: sube al instante y no espera a que el
          editor termine de escribir los alt del resto. */}
      <Card>
        <CardHeader>
          <CardTitle>Subir</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={uploadAction} className='flex flex-wrap items-end gap-3'>
            <Field className='flex-1'>
              <FieldLabel htmlFor='file'>Archivo</FieldLabel>
              <Input id='file' name='file' type='file' accept='image/png,image/jpeg,image/webp,image/avif' />
              <FieldDescription>
                Hasta 10 MB. Las dimensiones y el placeholder se calculan solos.
              </FieldDescription>
            </Field>
            <Button type='submit' disabled={isUploading}>
              <Upload className='size-4' /> {isUploading ? 'Subiendo…' : 'Subir'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <form action={saveAction} className='flex flex-col gap-4'>
        <input type='hidden' name='ids' value={JSON.stringify(images.map(image => image.id))} />
        <input type='hidden' name='deleted' value={JSON.stringify(deleted)} />

        {images.length === 0 && (
          <p className='text-muted-foreground rounded-lg border border-dashed p-8 text-center text-sm'>
            Este proyecto no tiene imágenes.
          </p>
        )}

        {images.map((image, index) => (
          <div
            key={image.id}
            className='border-border grid gap-4 rounded-lg border p-4 sm:grid-cols-[160px_1fr_auto]'
          >
            <div className='bg-muted relative aspect-video overflow-hidden rounded-md'>
              <Image
                src={storageUrl(image.storagePath)}
                alt=''
                fill
                sizes='160px'
                className='object-cover'
              />
            </div>

            <div className='flex flex-col gap-3'>
              <code className='text-muted-foreground text-xs break-all'>
                {image.storagePath} · {image.width}×{image.height}
              </code>
              {LOCALES.map(locale => (
                <Field key={locale}>
                  <FieldLabel htmlFor={`${image.id}.${locale}.alt`}>
                    Texto alternativo {LOCALE_LABELS[locale]}
                  </FieldLabel>
                  <Input
                    id={`${image.id}.${locale}.alt`}
                    name={`${image.id}.${locale}.alt`}
                    defaultValue={image.alts[locale] ?? ''}
                  />
                </Field>
              ))}
            </div>

            <div className='flex flex-col gap-1'>
              <Button
                type='button'
                variant='ghost'
                size='icon'
                aria-label='Mover antes'
                disabled={index === 0}
                onClick={() => move(index, -1)}
              >
                <ChevronLeft className='size-4' />
              </Button>
              <Button
                type='button'
                variant='ghost'
                size='icon'
                aria-label='Mover después'
                disabled={index === images.length - 1}
                onClick={() => move(index, 1)}
              >
                <ChevronRight className='size-4' />
              </Button>
              <Button
                type='button'
                variant='ghost'
                size='icon'
                aria-label='Eliminar'
                onClick={() => remove(image.id)}
              >
                <Trash2 className='text-destructive size-4' />
              </Button>
            </div>
          </div>
        ))}

        <div className='flex justify-end'>
          <Button type='submit' disabled={isSaving}>
            {isSaving ? 'Guardando…' : 'Guardar orden y textos'}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default ImagesManager
