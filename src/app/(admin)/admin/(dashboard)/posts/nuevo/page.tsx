// Next Imports
import Link from 'next/link'

// Component Imports
import { Button } from '@/components/admin/ui/button'
import NewPostForm from '@/components/admin/views/posts/NewPostForm'

export const metadata = { title: 'Nuevo post' }

const NewPostPage = () => (
  <div className='flex flex-col gap-6'>
    <div className='flex flex-wrap items-start justify-between gap-4'>
      <div>
        <h1 className='text-2xl font-semibold tracking-tight'>Nuevo artículo</h1>
        <p className='text-muted-foreground text-sm'>
          Empezá por el título. La URL y la clave se derivan solas y después se pueden cambiar.
        </p>
      </div>
      <Button variant='outline' size='sm' render={<Link href='/admin/posts' />}>
        Cancelar
      </Button>
    </div>

    <NewPostForm />
  </div>
)

export default NewPostPage
