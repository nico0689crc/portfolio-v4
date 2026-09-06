/**
 * Autenticación de servicio contra las APIs de Google, compartida por los
 * scripts locales.
 *
 * Sin dependencias: el JWT se firma con node:crypto y se cambia por un token
 * en el endpoint de OAuth. Traer `googleapis` serían decenas de megas para
 * hablar con tres endpoints REST.
 *
 * La clave vive solo en .env (ignorada por git) y nunca llega a Vercel: el
 * sitio desplegado no lee ni escribe métricas.
 */

import { readFileSync } from 'node:fs';
import { createSign } from 'node:crypto';
import { join } from 'node:path';

/** Vuelca .env en process.env sin pisar lo que ya venga del entorno. */
export function loadEnv() {
  for (const line of readFileSync(join(process.cwd(), '.env'), 'utf8').split('\n')) {
    // Los nombres llevan dígitos (GA4_PROPERTY_ID), de ahí el 0-9.
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
}

/** Acepta el JSON pegado entero o la ruta a un archivo, lo que sea más cómodo. */
export function credentials() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error('Falta GOOGLE_SERVICE_ACCOUNT_JSON en .env');
  return JSON.parse(raw.trimStart().startsWith('{') ? raw : readFileSync(raw, 'utf8'));
}

export async function accessToken(scopes) {
  const creds = credentials();
  const now = Math.floor(Date.now() / 1000);
  const b64 = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');
  const unsigned = `${b64({ alg: 'RS256', typ: 'JWT' })}.${b64({
    iss: creds.client_email,
    scope: scopes.join(' '),
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  })}`;

  const signature = createSign('RSA-SHA256')
    .update(unsigned)
    .sign(creds.private_key)
    .toString('base64url');

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${unsigned}.${signature}`,
    }),
  });

  const body = await res.json();
  if (!res.ok) throw new Error(`No se pudo autenticar: ${body.error_description ?? res.status}`);
  return body.access_token;
}

/** Llamada REST con el token ya obtenido. Sin `payload` hace un GET. */
export async function request(token, url, payload) {
  const res = await fetch(url, {
    method: payload ? 'POST' : 'GET',
    headers: {
      authorization: `Bearer ${token}`,
      ...(payload ? { 'content-type': 'application/json' } : {}),
    },
    ...(payload ? { body: JSON.stringify(payload) } : {}),
  });
  const body = await res.json();
  if (!res.ok) {
    const err = new Error(body?.error?.message ?? `HTTP ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return body;
}

// --- Presentación ----------------------------------------------------------

export const BOLD = '\x1b[1m';
export const DIM = '\x1b[2m';
export const GREEN = '\x1b[32m';
export const RED = '\x1b[31m';
export const OFF = '\x1b[0m';

export function heading(text) {
  console.log(`\n${BOLD}${text}${OFF}`);
  console.log(DIM + '─'.repeat(text.length) + OFF);
}

/** Ancho visible: descuenta los códigos de color para que las columnas cierren. */
const width = (s) => String(s).replace(/\x1b\[[0-9;]*m/g, '').length;

export function table(headers, rows) {
  if (!rows.length) {
    console.log(`${DIM}(sin datos todavía)${OFF}`);
    return;
  }
  const widths = headers.map((h, i) => Math.max(width(h), ...rows.map((r) => width(r[i] ?? ''))));
  const line = (cells) =>
    cells
      .map((c, i) => {
        const padding = ' '.repeat(widths[i] - width(c ?? ''));
        return i === 0 ? `${c ?? ''}${padding}` : `${padding}${c ?? ''}`;
      })
      .join('  ');

  console.log(DIM + line(headers) + OFF);
  for (const row of rows) console.log(line(row));
}
