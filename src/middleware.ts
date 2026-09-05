import { NextResponse, type NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { createServerClient } from '@supabase/ssr';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

/**
 * Refresco de la sesión del backoffice.
 *
 * Los tokens de Supabase caducan a la hora. Un Server Component no puede
 * escribir cookies, así que si nadie renueva la sesión acá, el editor termina
 * expulsado al login en medio de una edición. `getUser()` hace la revalidación
 * y `@supabase/ssr` escribe las cookies nuevas sobre la respuesta.
 *
 * No autoriza nada: quién puede entrar lo decide `requireAdmin()` en el layout,
 * que además chequea la tabla `admins`.
 */
async function refreshAdminSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }

          response = NextResponse.next({ request });

          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        }
      }
    }
  );

  await supabase.auth.getUser();

  return response;
}

export default async function middleware(request: NextRequest) {
  // El panel queda fuera de next-intl a propósito: es monolingüe y su árbol de
  // rutas es hermano de [locale], así que reescribirle el prefijo de idioma lo
  // mandaría a un 404.
  if (request.nextUrl.pathname.startsWith('/admin')) {
    return refreshAdminSession(request);
  }

  return intlMiddleware(request);
}

export const config = {
  // Match all pathnames except for
  // - API routes
  // - _next (static files, etc.)
  // - _vercel (Vercel specific)
  // - All files in the public folder (e.g. favicon.ico)
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
