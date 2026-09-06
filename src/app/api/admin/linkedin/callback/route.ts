import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/admin/auth';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { STATE_COOKIE, exchangeCode, fetchAccount } from '@/lib/social/linkedin-auth';

/** Vuelve al panel con el resultado en la query, que es lo que la página lee para avisar. */
const back = (request: NextRequest, params: Record<string, string>) =>
  NextResponse.redirect(
    new URL(`/admin/linkedin?${new URLSearchParams(params)}`, request.nextUrl.origin)
  );

/**
 * La vuelta de LinkedIn: canjea el código y guarda el token.
 *
 * `requireAdmin()` acá no es redundante con el `state`: el state prueba que el
 * flujo lo arrancó esta sesión, no que quien vuelve tenga permiso de escribir
 * credenciales en la base.
 */
export async function GET(request: NextRequest) {
  await requireAdmin();

  const params = request.nextUrl.searchParams;
  const error = params.get('error_description') ?? params.get('error');

  if (error) return back(request, { error });

  const code = params.get('code');
  const state = params.get('state');
  const jar = await cookies();
  const expected = jar.get(STATE_COOKIE)?.value;

  jar.delete(STATE_COOKIE);

  if (!code) return back(request, { error: 'LinkedIn no devolvió el código' });
  if (!state || state !== expected) return back(request, { error: 'El state no coincide' });

  try {
    const credentials = await exchangeCode(code, request.nextUrl.origin);
    const account = await fetchAccount(credentials.accessToken);
    const supabase = await createSupabaseServerClient();

    // Upsert sobre la clave `provider`: reconectar es reemplazar el token, no
    // acumular filas. Es la operación normal cada 60 días.
    const { error: saveError } = await supabase.from('social_accounts').upsert({
      provider: 'linkedin',
      account_urn: account.urn,
      account_name: account.name,
      access_token: credentials.accessToken,
      refresh_token: credentials.refreshToken,
      expires_at: credentials.expiresAt.toISOString(),
      scopes: credentials.scopes,
      connected_at: new Date().toISOString(),
    });

    if (saveError) return back(request, { error: saveError.message });

    return back(request, { conectado: account.name ?? account.urn });
  } catch (err) {
    return back(request, { error: err instanceof Error ? err.message : String(err) });
  }
}
