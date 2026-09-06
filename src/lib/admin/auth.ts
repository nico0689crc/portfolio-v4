import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export type AdminUser = {
  id: string;
  email: string;
};

/**
 * Sesión del backoffice, o redirect al login.
 *
 * Dos chequeos, no uno. `getUser()` sólo prueba que hay una sesión válida de
 * Supabase Auth; la que habilita el panel es la fila en `admins`, la misma que
 * lee `is_admin()` en las policies. Sin ese segundo paso, cualquier usuario que
 * se registrara en el proyecto entraría al panel y vería un shell vacío contra
 * el que RLS le rechaza todo — peor UX y peor señal de seguridad que un redirect.
 *
 * El SELECT sobre `admins` corre con la sesión del usuario, así que la policy de
 * esa tabla tiene que dejarlo leer su propia fila.
 */
export async function requireAdmin(): Promise<AdminUser> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect('/admin/login');

  const { data: admin } = await supabase
    .from('admins')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!admin) redirect('/admin/login?error=not-admin');

  return { id: user.id, email: user.email ?? '' };
}
