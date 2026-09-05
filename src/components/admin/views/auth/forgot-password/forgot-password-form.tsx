'use client'

// React Imports
import { useActionState } from 'react'

// Components Import
import { Alert, AlertDescription } from '@/components/admin/ui/alert'
import { Button } from '@/components/admin/ui/button'
import { Field, FieldGroup, FieldLabel } from '@/components/admin/ui/field'
import { Input } from '@/components/admin/ui/input'

// Action Imports
import { requestPasswordReset } from '@/lib/admin/actions'

const ForgotPasswordForm = () => {
  const [state, formAction, isPending] = useActionState(requestPasswordReset, { error: null, sent: false })

  if (state.sent) {
    return (
      <Alert>
        <AlertDescription>
          Si esa dirección tiene una cuenta de editor, te llega un link para restablecer la contraseña.
        </AlertDescription>
      </Alert>
    )
  }

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
          <Input type='email' id='email' name='email' autoComplete='username' required placeholder='tu@email.com' />
        </Field>
        <Field>
          <Button className='w-full' type='submit' disabled={isPending}>
            {isPending ? 'Enviando…' : 'Enviar link'}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}

export default ForgotPasswordForm
