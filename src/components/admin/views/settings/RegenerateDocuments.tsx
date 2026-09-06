'use client'

// React Imports
import { useState, useTransition } from 'react'

// Third-party Imports
import { toast } from 'sonner'
import { RefreshCw } from 'lucide-react'

// Component Imports
import { Button } from '@/components/admin/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/admin/ui/card'
import { FieldDescription } from '@/components/admin/ui/field'

// Lib Imports
import { regenerateDocuments } from '@/lib/admin/regenerate-actions'

const RegenerateDocuments = () => {
  const [isPending, startTransition] = useTransition()
  const [lastRun, setLastRun] = useState<string | null>(null)

  const run = () =>
    startTransition(async () => {
      const { error, regeneratedAt } = await regenerateDocuments()

      if (error) {
        toast.error(error)

        return
      }

      setLastRun(regeneratedAt)
      toast.success('Documentos regenerados')
    })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Documentos generados</CardTitle>
      </CardHeader>
      <CardContent className='flex flex-col gap-4'>
        <FieldDescription>
          El CV en PDF, el JSON Resume, los feeds RSS y el archivo para modelos de lenguaje se arman
          desde la base y quedan cacheados. Guardar desde el panel los actualiza; esto hace falta
          cuando el contenido cambió por fuera —una migración, o una edición directa en Supabase.
        </FieldDescription>

        <div className='flex flex-wrap items-center gap-3'>
          <Button type='button' variant='outline' disabled={isPending} onClick={run}>
            <RefreshCw className={`size-4 ${isPending ? 'animate-spin' : ''}`} />
            {isPending ? 'Regenerando…' : 'Regenerar ahora'}
          </Button>

          {lastRun && (
            <span className='text-muted-foreground text-sm'>
              Última vez: {new Date(lastRun).toLocaleTimeString('es-AR')}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default RegenerateDocuments
