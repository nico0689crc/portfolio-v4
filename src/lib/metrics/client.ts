/**
 * Acceso de solo lectura a las APIs de Google (Search Console y GA4).
 *
 * Server-only: usa `node:crypto` y `node:fs`, así que un import desde el
 * cliente rompe el build en vez de filtrar la clave. No se exporta desde
 * ningún barrel a propósito — ese fue el camino por el que una vez terminaron
 * APIs de servidor en el bundle del navegador.
 *
 * Sin `googleapis`: el JWT se firma a mano contra el endpoint de OAuth. Son
 * decenas de megas para hablar con tres endpoints REST, y esto entra en el
 * bundle de funciones serverless.
 *
 * La cuenta de servicio tiene permiso de Lector en ambas propiedades. Si la
 * clave se filtrara, el daño es que alguien lea estadísticas de tráfico: por
 * eso esta sí puede vivir en Vercel, a diferencia de la service_role de
 * Supabase, que saltea RLS y puede borrar la base.
 */

import { createSign } from 'node:crypto';
import { readFileSync } from 'node:fs';

const SCOPES = [
  'https://www.googleapis.com/auth/webmasters.readonly',
  'https://www.googleapis.com/auth/analytics.readonly',
];

export type MetricsConfig = {
  credentials: { client_email: string; private_key: string };
  ga4Property: string;
  searchConsoleSite: string;
};

/**
 * Devuelve la configuración, o `null` si falta algo.
 *
 * Null y no una excepción: el panel tiene que poder abrirse y explicar qué
 * falta. Un deploy sin estas variables es un estado esperable, no un error.
 */
export function metricsConfig(): MetricsConfig | null {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  const ga4Property = (process.env.GA4_PROPERTY_ID ?? '').replace(/^properties\//, '');
  const searchConsoleSite = process.env.SEARCH_CONSOLE_SITE_URL ?? '';

  if (!raw || !ga4Property || !searchConsoleSite) return null;

  try {
    // En Vercel siempre es el JSON pegado; la ruta a un archivo solo sirve en
    // local, donde la clave vive fuera del repo.
    const credentials = JSON.parse(
      raw.trimStart().startsWith('{') ? raw : readFileSync(raw, 'utf8')
    );

    if (!credentials.client_email || !credentials.private_key) return null;

    return { credentials, ga4Property, searchConsoleSite };
  } catch {
    return null;
  }
}

/** El token dura una hora; pedir uno nuevo por consulta serían cuatro de más. */
let cachedToken: { value: string; expiresAt: number } | null = null;

async function accessToken(config: MetricsConfig): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.value;

  const now = Math.floor(Date.now() / 1000);
  const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url');
  const unsigned = `${encode({ alg: 'RS256', typ: 'JWT' })}.${encode({
    iss: config.credentials.client_email,
    scope: SCOPES.join(' '),
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  })}`;

  const signature = createSign('RSA-SHA256')
    .update(unsigned)
    .sign(config.credentials.private_key)
    .toString('base64url');

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${unsigned}.${signature}`,
    }),
    cache: 'no-store',
  });

  const body = await res.json();

  if (!res.ok) throw new Error(body.error_description ?? `No se pudo autenticar (${res.status})`);

  cachedToken = { value: body.access_token, expiresAt: Date.now() + body.expires_in * 1000 };

  return body.access_token;
}

export async function apiPost<T>(
  config: MetricsConfig,
  url: string,
  payload: unknown
): Promise<T> {
  const token = await accessToken(config);

  const res = await fetch(url, {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  const body = await res.json();

  if (!res.ok) {
    throw new Error(
      typeof body?.error?.message === 'string' ? body.error.message : `HTTP ${res.status}`
    );
  }

  return body as T;
}
