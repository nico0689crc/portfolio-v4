'use client'

// React Imports
import { useActionState, useState } from 'react'

// Next Imports
import Link from 'next/link'

// Third-party Imports
import { EyeIcon, EyeOffIcon } from 'lucide-react'

// Components Import
import { Alert, AlertDescription } from '@/components/admin/ui/alert'
import { Button } from '@/components/admin/ui/button'
import { Field, FieldGroup, FieldLabel } from '@/components/admin/ui/field'
import { Input } from '@/components/admin/ui/input'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/admin/ui/input-group'

// Action Imports
import { signIn } from '@/lib/admin/actions'

const LoginForm = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [state, formAction, isPending] = useActionState(signIn, { error: null })

  return (
    <form action={formAction}>
      <FieldGroup className='gap-4'>
        {state.error && (
          <Alert variant='destructive'>
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}
        <Field className='gap-2'>
          <FieldLabel htmlFor='email' className='leading-5'>
            Email
          </FieldLabel>
          <Input
            type='email'
            id='email'
            name='email'
            autoComplete='username'
            required
            placeholder='tu@email.com'
          />
        </Field>
        <Field className='w-full gap-2'>
          <FieldLabel htmlFor='password' className='leading-5'>
            Contraseña
          </FieldLabel>
          <InputGroup>
            <InputGroupInput
              id='password'
              name='password'
              type={isVisible ? 'text' : 'password'}
              autoComplete='current-password'
              required
              placeholder='••••••••••••••••'
            />
            <InputGroupAddon align='inline-end' className='pr-1.5'>
              <Button
                type='button'
                variant='ghost'
                size='icon'
                onClick={() => setIsVisible(prevState => !prevState)}
                className='text-muted-foreground rounded-l-none hover:bg-transparent'
              >
                {isVisible ? <EyeOffIcon /> : <EyeIcon />}
                <span className='sr-only'>{isVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'}</span>
              </Button>
            </InputGroupAddon>
          </InputGroup>
        </Field>
        <div className='flex justify-end'>
          <Link href='/admin/recuperar-clave' className='text-sm text-nowrap hover:underline'>
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
        <Field>
          <Button className='w-full' type='submit' disabled={isPending}>
            {isPending ? 'Entrando…' : 'Entrar al panel'}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}

export default LoginForm
