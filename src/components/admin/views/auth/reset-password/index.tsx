// Next Imports
import Link from 'next/link'

// Third-party imports
import { ChevronLeftIcon } from 'lucide-react'

// Component Imports
import Logo from '@/components/admin/shared/Logo'
import { Button } from '@/components/admin/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/admin/ui/card'
import ResetPasswordForm from '@/components/admin/views/auth/reset-password/reset-password-form'

// SVG Imports
import AuthBackgroundShape from '@/components/admin/assets/auth-background-shape'

const ResetPassword = () => {
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
            <CardTitle className='mb-2 text-2xl font-semibold'>Nueva contraseña</CardTitle>
            <CardDescription className='text-base'>
              Elegí la contraseña con la que vas a entrar al panel.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className='space-y-4 px-6'>
          {/* ResetPassword Form */}
          <ResetPasswordForm />

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

export default ResetPassword
