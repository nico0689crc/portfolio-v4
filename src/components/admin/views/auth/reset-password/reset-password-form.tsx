'use client'

// React Imports
import { useActionState, useState } from 'react'

// Third-party Imports
import { EyeIcon, EyeOffIcon } from 'lucide-react'

// Components Import
import { Alert, AlertDescription } from '@/components/admin/ui/alert'
import { Button } from '@/components/admin/ui/button'
import { Field, FieldGroup, FieldLabel } from '@/components/admin/ui/field'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/admin/ui/input-group'

// Action Imports
import { updatePassword } from '@/lib/admin/actions'

const ResetPasswordForm = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [state, formAction, isPending] = useActionState(updatePassword, { error: null })

  return (
    <form action={formAction}>
      <FieldGroup className='gap-4'>
        {state.error && (
          <Alert variant='destructive'>
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}
        <Field className='w-full gap-2'>
          <FieldLabel htmlFor='password' className='leading-5'>
            Nueva contraseña
          </FieldLabel>
          <InputGroup>
            <InputGroupInput
              id='password'
              name='password'
              type={isVisible ? 'text' : 'password'}
              autoComplete='new-password'
              required
              minLength={8}
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
        <Field className='w-full gap-2'>
          <FieldLabel htmlFor='confirmPassword' className='leading-5'>
            Repetir contraseña
          </FieldLabel>
          <InputGroup>
            <InputGroupInput
              id='confirmPassword'
              name='confirmPassword'
              type={isVisible ? 'text' : 'password'}
              autoComplete='new-password'
              required
              minLength={8}
              placeholder='••••••••••••••••'
            />
          </InputGroup>
        </Field>
        <Field>
          <Button className='w-full' type='submit' disabled={isPending}>
            {isPending ? 'Guardando…' : 'Guardar contraseña'}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}

export default ResetPasswordForm
