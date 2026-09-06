/**
 * OAuth con LinkedIn para el panel.
 *
 * Server-only. Es el precio de no pasar por Buffer: hay que sostener el token
 * a mano. Con una app self-serve LinkedIn da 60 días y **no** devuelve refresh
 * token —los programáticos son sólo para partners aprobados del Marketing
 * Developer Platform—, así que cada dos meses hay que volver a autorizar desde
 * el panel. Por eso `expires_at` se guarda: es lo único que permite avisar
 * antes de que un posteo falle por un token vencido.
 */

const AUTH_URL = 'https://www.linkedin.com/oauth/v2/authorization';
const TOKEN_URL = 'https://www.linkedin.com/oauth/v2/accessToken';
const USERINFO_URL = 'https://api.linkedin.com/v2/userinfo';

/**
 * `openid profile` no es decorativo: es lo que permite resolver el URN de la
 * persona, que la API pide como autor de cada posteo.
 *
 * `w_member_social_feed` —el permiso del primer comentario— no está por
 * defecto: es un scope aparte que "Share on LinkedIn" no incluye, y pedir uno
 * que la app no tiene hace fallar la autorización entera. Si el portal llega a
 * concederlo, se agrega acá por env var sin tocar código.
 */
const DEFAULT_SCOPES = 'openid profile w_member_social';

export const LINKEDIN_SCOPES = process.env.LINKEDIN_SCOPES ?? DEFAULT_SCOPES;

/** El nombre de la cookie con el `state`, que es lo que ata el callback a esta sesión. */
export const STATE_COOKIE = 'li_oauth_state';

export type LinkedInCredentials = {
  accessToken: string;
  refreshToken: string | null;
  expiresAt: Date;
  scopes: string;
};

export function getOAuthConfig() {
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;

  if (!clientId || !clientSecret) return null;

  return { clientId, clientSecret };
}

/** Tiene que coincidir carácter por carácter con la registrada en el portal de LinkedIn. */
export function redirectUri(origin: string) {
  return process.env.LINKEDIN_REDIRECT_URI ?? `${origin}/api/admin/linkedin/callback`;
}

export function authorizeUrl(clientId: string, origin: string, state: string) {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri(origin),
    state,
    scope: LINKEDIN_SCOPES,
  });

  return `${AUTH_URL}?${params}`;
}

export async function exchangeCode(code: string, origin: string): Promise<LinkedInCredentials> {
  const config = getOAuthConfig();

  if (!config) throw new Error('LINKEDIN_CLIENT_ID / LINKEDIN_CLIENT_SECRET no configurados');

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri(origin),
      client_id: config.clientId,
      client_secret: config.clientSecret,
    }),
    cache: 'no-store',
  });

  const body = (await res.json()) as {
    access_token?: string;
    expires_in?: number;
    refresh_token?: string;
    scope?: string;
    error_description?: string;
    error?: string;
  };

  if (!res.ok || !body.access_token) {
    throw new Error(body.error_description ?? body.error ?? `LinkedIn respondió HTTP ${res.status}`);
  }

  return {
    accessToken: body.access_token,
    refreshToken: body.refresh_token ?? null,
    expiresAt: new Date(Date.now() + (body.expires_in ?? 0) * 1000),
    scopes: body.scope ?? LINKEDIN_SCOPES,
  };
}

/**
 * Quién es el dueño del token.
 *
 * El `sub` de OpenID Connect es el id de miembro, y el URN que la API de posts
 * quiere como autor se arma con él. Se resuelve una sola vez al conectar: no
 * cambia, y pedirlo en cada publicación sería un viaje de más por nada.
 */
export async function fetchAccount(accessToken: string): Promise<{ urn: string; name: string | null }> {
  const res = await fetch(USERINFO_URL, {
    headers: { authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });

  if (!res.ok) throw new Error(`No se pudo leer el perfil de LinkedIn (HTTP ${res.status})`);

  const body = (await res.json()) as { sub?: string; name?: string };

  if (!body.sub) throw new Error('LinkedIn no devolvió el id de la cuenta');

  return { urn: `urn:li:person:${body.sub}`, name: body.name ?? null };
}
