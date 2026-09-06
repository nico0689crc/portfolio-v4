import type { Metadata } from 'next'
import ForgotPassword from '@/components/admin/views/auth/forgot-password'

export const metadata: Metadata = { title: 'Recuperar contraseña · Panel' }

const ForgotPasswordPage = () => <ForgotPassword />

export default ForgotPasswordPage
