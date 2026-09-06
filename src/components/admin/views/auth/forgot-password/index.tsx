// Next Imports
import Link from 'next/link'

// Third-party Imports
import { ChevronLeftIcon } from 'lucide-react'

// Component Import
import Logo from '@/components/admin/shared/Logo'
import { Button } from '@/components/admin/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/admin/ui/card'
import ForgotPasswordForm from '@/components/admin/views/auth/forgot-password/forgot-password-form'

// SVG Import
import AuthBackgroundShape from '@/components/admin/assets/auth-background-shape'

const ForgotPassword = () => {
  return (
    <div className='relative flex h-auto min-h-screen items-center justify-center overflow-x-hidden px-4 py-10 sm:px-6 lg:px-8'>
      <div className='absolute'>
        <AuthBackgroundShape />
      </div>

      <Card className='z-1 w-full gap-6 py-6 sm:max-w-md'>
        <CardHeader className='gap-6 px-6'>
          <Link href='/'>
            <Logo className='gap-3' />
          </Link>

          <div>
            <CardTitle className='mb-1.5 text-2xl font-semibold'>¿Olvidaste tu contraseña?</CardTitle>
            <CardDescription className='text-base'>
              Te mandamos un link para elegir una nueva.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className='space-y-4 px-6'>
          {/* ForgotPassword Form */}
          <ForgotPasswordForm />

          <Button
            variant='ghost'
            className='group w-full'
            render={<Link href='/admin/login' />}
            nativeButton={false}
          >
            <ChevronLeftIcon className='size-5 transition-transform duration-200 group-hover:-translate-x-0.5' />
            Volver al login
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default ForgotPassword
