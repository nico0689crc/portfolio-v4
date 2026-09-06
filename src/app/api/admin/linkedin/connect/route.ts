import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/admin/auth';
import { STATE_COOKIE, authorizeUrl, getOAuthConfig } from '@/lib/social/linkedin-auth';

/**
 * Arranca la autorización con LinkedIn.
 *
 * Es una ruta y no un server action porque termina en un redirect a un dominio
 * externo con un `state` que hay que poder verificar a la vuelta, y para eso
 * hace falta escribir una cookie antes de irse.
 */
export async function GET(request: NextRequest) {
  await requireAdmin();

  const config = getOAuthConfig();

  if (!config) {
    return NextResponse.json(
      { error: 'LINKEDIN_CLIENT_ID / LINKEDIN_CLIENT_SECRET no configurados' },
      { status: 501 }
    );
  }

  const state = crypto.randomUUID();

  // httpOnly y del lado del servidor: el `state` sólo tiene sentido si el
  // atacante no puede leerlo ni fabricarlo. Diez minutos alcanzan de sobra
  // para autorizar y no dejan la cookie dando vueltas.
  ;(await cookies()).set(STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 600,
  });

  return NextResponse.redirect(authorizeUrl(config.clientId, request.nextUrl.origin, state));
}
