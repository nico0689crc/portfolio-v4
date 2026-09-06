import type { Metadata } from 'next'
import ResetPassword from '@/components/admin/views/auth/reset-password'

export const metadata: Metadata = { title: 'Nueva contraseña · Panel' }

const ResetPasswordPage = () => <ResetPassword />

export default ResetPasswordPage
