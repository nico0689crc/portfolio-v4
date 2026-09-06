'use server';

import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';

/**
 * Acciones de sesión del backoffice.
 *
 * Van como server actions y no como llamadas desde el browser a propósito: el
 * cliente de `@/lib/supabase/server` escribe la cookie de sesión con `cookies()`,
 * que sólo funciona en un contexto de escritura — action o route handler. Eso
 * mantiene un único cliente de Supabase en el proyecto en vez de sumar uno de
 * browser sólo para el login.
 */

export type AuthFormState = { error: string | null };

export async function signIn(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  if (!email || !password) {
    return { error: 'Completá el email y la contraseña.' };
  }

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  // Mensaje deliberadamente vago: distinguir "no existe" de "clave incorrecta"
  // convierte el login en un oráculo de qué mails tienen cuenta.
  if (error || !data.user) {
    return { error: 'Email o contraseña incorrectos.' };
  }

  // Autenticarse no alcanza: el panel es para quien tiene fila en `admins`. Sin
  // este chequeo la sesión quedaría abierta y el guard del layout devolvería al
  // login en loop, sin explicar nunca por qué.
  const { data: admin } = await supabase
    .from('admins')
    .select('user_id')
    .eq('user_id', data.user.id)
    .maybeSingle();

  if (!admin) {
    await supabase.auth.signOut();

    return { error: 'Esta cuenta no tiene acceso al panel.' };
  }

  redirect('/admin');
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();

  await supabase.auth.signOut();
  redirect('/admin/login');
}

export async function requestPasswordReset(
  _prev: AuthFormState & { sent?: boolean },
  formData: FormData
): Promise<AuthFormState & { sent?: boolean }> {
  const email = String(formData.get('email') ?? '').trim();

  if (!email) return { error: 'Ingresá tu email.', sent: false };

  const supabase = await createSupabaseServerClient();

  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/admin/restablecer-clave`
  });

  // Respuesta idéntica exista o no la cuenta, por la misma razón que arriba.
  return { error: null, sent: true };
}

export async function updatePassword(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const password = String(formData.get('password') ?? '');
  const confirm = String(formData.get('confirmPassword') ?? '');

  if (password.length < 8) return { error: 'La contraseña necesita al menos 8 caracteres.' };
  if (password !== confirm) return { error: 'Las contraseñas no coinciden.' };

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.updateUser({ password });

  if (error) return { error: 'No se pudo actualizar la contraseña. Pedí un link nuevo.' };

  redirect('/admin');
}
