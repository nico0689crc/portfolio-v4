import type { Metadata } from 'next'
import Login from '@/components/admin/views/auth/login'

export const metadata: Metadata = { title: 'Entrar · Panel' }

const LoginPage = () => <Login />

export default LoginPage
