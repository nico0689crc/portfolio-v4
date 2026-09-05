// Next Imports
import Link from 'next/link'

// Components Import
import Logo from '@/components/admin/shared/Logo'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/admin/ui/card'
import LoginForm from '@/components/admin/views/auth/login/login-form'

// SVG Import
import AuthBackgroundShape from '@/components/admin/assets/auth-background-shape'

const Login = () => {
  return (
    <div className='relative flex h-auto min-h-screen items-center justify-center overflow-x-hidden px-4 py-10 sm:px-6 lg:px-8'>
      <div className='absolute'>
        <AuthBackgroundShape />
      </div>

      <Card className='z-1 w-full gap-6 py-6 sm:max-w-lg'>
        <CardHeader className='gap-6 px-6'>
          <Link href='/'>
            <Logo className='gap-3' />
          </Link>

          <div>
            <CardTitle className='mb-2 text-2xl font-semibold'>Panel de contenido</CardTitle>
            <CardDescription className='text-base'>Acceso restringido a editores.</CardDescription>
          </div>
        </CardHeader>

        <CardContent className='px-6'>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  )
}

export default Login
