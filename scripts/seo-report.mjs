#!/usr/bin/env node
/**
 * Informe de SEO: Search Console + Google Analytics 4.
 *
 * Se consulta a mano, cuando querés saber cómo viene el posicionamiento. No
 * guarda nada: la serie histórica ya la guardan Google y Search Console, y
 * duplicarla acá solo agrega una base que se desincroniza.
 *
 * Search Console responde "¿nos encuentran?" (impresiones, clics, posición por
 * consulta y por página) y GA4 responde "¿de dónde vienen y qué hacen?" (país,
 * páginas, descargas del CV). Son preguntas distintas y por eso el informe
 * tiene dos mitades.
 *
 * Sin dependencias: el JWT se firma con node:crypto contra la cuenta de
 * servicio. La clave vive solo en .env (ignorado por git) y nunca en Vercel —
 * el sitio desplegado no necesita leer métricas.
 *
 *   node scripts/seo-report.mjs [--days 28] [--json]
 */

import { readFileSync } from 'node:fs';
import { createSign } from 'node:crypto';
import { join } from 'node:path';

const ROOT = process.cwd();

// ---------------------------------------------------------------------------
// Environment
// ---------------------------------------------------------------------------

for (const line of readFileSync(join(ROOT, '.env'), 'utf8').split('\n')) {
  // Los nombres llevan dígitos (GA4_PROPERTY_ID), de ahí el 0-9 en la clase.
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
}

const RAW_CREDS = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
const GA4_PROPERTY = (process.env.GA4_PROPERTY_ID ?? '').replace(/^properties\//, '');
const SC_SITE = process.env.SEARCH_CONSOLE_SITE_URL;

const missing = [
  !RAW_CREDS && 'GOOGLE_SERVICE_ACCOUNT_JSON',
  !GA4_PROPERTY && 'GA4_PROPERTY_ID',
  !SC_SITE && 'SEARCH_CONSOLE_SITE_URL',
].filter(Boolean);

if (missing.length) {
  console.error(`Faltan variables en .env: ${missing.join(', ')}`);
  process.exit(1);
}

/** Acepta el JSON pegado entero o la ruta a un archivo, lo que sea más cómodo. */
const creds = JSON.parse(
  RAW_CREDS.trimStart().startsWith('{') ? RAW_CREDS : readFileSync(RAW_CREDS, 'utf8'),
);

// ---------------------------------------------------------------------------
// Argumentos
// ---------------------------------------------------------------------------

const argv = process.argv.slice(2);
const AS_JSON = argv.includes('--json');
/** Lista las propiedades que la cuenta de servicio alcanza. Es el primer
 *  diagnostico util ante un 403: casi siempre el nombre de la propiedad no es
 *  el que uno cree (apex vs www, prefijo de URL vs dominio). */
const LIST_SITES = argv.includes('--sites');
const DAYS = Number(argv[argv.indexOf('--days') + 1]) || 28;

/** Search Console cierra el día con 2-3 de retraso; hoy siempre viene vacío. */
const day = (offset) => new Date(Date.now() - offset * 86_400_000).toISOString().slice(0, 10);

const period = { start: day(DAYS), end: day(1) };
const previous = { start: day(DAYS * 2), end: day(DAYS + 1) };

// ---------------------------------------------------------------------------
// Autenticación
// ---------------------------------------------------------------------------

const SCOPES = [
  'https://www.googleapis.com/auth/webmasters.readonly',
  'https://www.googleapis.com/auth/analytics.readonly',
];

async function accessToken() {
  const now = Math.floor(Date.now() / 1000);
  const b64 = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');
  const unsigned = `${b64({ alg: 'RS256', typ: 'JWT' })}.${b64({
    iss: creds.client_email,
    scope: SCOPES.join(' '),
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

// ---------------------------------------------------------------------------
// Clientes
// ---------------------------------------------------------------------------

let TOKEN;

async function call(url, payload) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { authorization: `Bearer ${TOKEN}`, 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const body = await res.json();
  if (!res.ok) {
    const detail = body?.error?.message ?? `HTTP ${res.status}`;
    const err = new Error(detail);
    err.status = res.status;
    throw err;
  }
  return body;
}

/** Una consulta a Search Console. `dimensions` vacío devuelve solo los totales. */
async function searchConsole(dimensions, range, rowLimit = 25) {
  const url = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(
    SC_SITE,
  )}/searchAnalytics/query`;
  const body = await call(url, {
    startDate: range.start,
    endDate: range.end,
    dimensions,
    rowLimit,
    // 'all' incluye los días todavía incompletos; sin esto los últimos 3 días
    // simplemente no existen y el período corto miente hacia abajo.
    dataState: 'all',
  });
  return body.rows ?? [];
}

async function ga4(dimensions, metrics, range, limit = 25) {
  const url = `https://analyticsdata.googleapis.com/v1beta/properties/${GA4_PROPERTY}:runReport`;
  const body = await call(url, {
    dateRanges: [{ startDate: range.start, endDate: range.end }],
    dimensions: dimensions.map((name) => ({ name })),
    metrics: metrics.map((name) => ({ name })),
    limit,
  });
  return (body.rows ?? []).map((row) => ({
    keys: (row.dimensionValues ?? []).map((d) => d.value),
    values: (row.metricValues ?? []).map((m) => Number(m.value)),
  }));
}

// ---------------------------------------------------------------------------
// Salida
// ---------------------------------------------------------------------------

const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';
const OFF = '\x1b[0m';

const pct = (n) => `${(n * 100).toFixed(1)}%`;
const pos = (n) => n.toFixed(1);

function delta(now, before, { lowerIsBetter = false } = {}) {
  if (!before) return '';
  const change = ((now - before) / before) * 100;
  if (Math.abs(change) < 0.5) return `${DIM}sin cambio${OFF}`;
  const better = lowerIsBetter ? change < 0 : change > 0;
  const arrow = change > 0 ? '▲' : '▼';
  return `${better ? '\x1b[32m' : '\x1b[31m'}${arrow} ${Math.abs(change).toFixed(0)}%${OFF}`;
}

function heading(text) {
  console.log(`\n${BOLD}${text}${OFF}`);
  console.log(DIM + '─'.repeat(text.length) + OFF);
}

/** Ancho visible: descuenta los códigos de color para que las columnas cierren. */
const width = (s) => String(s).replace(/\x1b\[[0-9;]*m/g, '').length;

function table(headers, rows) {
  if (!rows.length) {
    console.log(`${DIM}(sin datos todavía)${OFF}`);
    return;
  }
  const widths = headers.map((h, i) =>
    Math.max(width(h), ...rows.map((r) => width(r[i] ?? ''))),
  );
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

/** Recorta rutas largas por el medio: el final de la URL es lo que identifica. */
function shorten(value, max = 52) {
  const path = value.replace(/^https?:\/\/[^/]+/, '') || '/';
  if (path.length <= max) return path;
  return `${path.slice(0, max - 14)}…${path.slice(-13)}`;
}

// ---------------------------------------------------------------------------
// Informe
// ---------------------------------------------------------------------------

async function main() {
  TOKEN = await accessToken();

  if (LIST_SITES) {
    const res = await fetch('https://searchconsole.googleapis.com/webmasters/v3/sites', {
      headers: { authorization: `Bearer ${TOKEN}` },
    });
    const body = await res.json();
    heading('Propiedades visibles para la cuenta de servicio');
    table(
      ['propiedad', 'permiso'],
      (body.siteEntry ?? []).map((s) => [s.siteUrl, s.permissionLevel]),
    );
    console.log('');
    return;
  }

  const report = { period, previous, searchConsole: {}, ga4: {} };

  // --- Search Console ------------------------------------------------------
  const [totals, before, queries, pages, countries] = await Promise.all([
    searchConsole([], period, 1),
    searchConsole([], previous, 1),
    searchConsole(['query'], period, 20),
    searchConsole(['page'], period, 20),
    searchConsole(['country'], period, 10),
  ]);

  const t = totals[0];
  const b = before[0];
  report.searchConsole = { totals: t ?? null, previous: b ?? null, queries, pages, countries };

  if (!AS_JSON) {
    console.log(
      `\n${BOLD}Informe de SEO${OFF}  ${DIM}${period.start} → ${period.end} (${DAYS} días)${OFF}`,
    );

    heading('Search Console · totales');
    if (!t || !t.impressions) {
      console.log(
        `${DIM}Sin impresiones en el período. Search Console tarda 2-3 días en\n` +
          `publicar datos y el sitio se indexó hace poco.${OFF}`,
      );
    } else {
      table(
        ['', 'valor', 'vs. período anterior'],
        [
          ['Clics', String(t.clicks), delta(t.clicks, b?.clicks)],
          ['Impresiones', String(t.impressions), delta(t.impressions, b?.impressions)],
          ['CTR', pct(t.ctr), delta(t.ctr, b?.ctr)],
          ['Posición media', pos(t.position), delta(t.position, b?.position, { lowerIsBetter: true })],
        ],
      );
    }

    heading('Search Console · consultas');
    table(
      ['consulta', 'impr.', 'clics', 'CTR', 'pos.'],
      queries.map((r) => [
        r.keys[0],
        String(r.impressions),
        String(r.clicks),
        pct(r.ctr),
        pos(r.position),
      ]),
    );

    heading('Search Console · páginas');
    table(
      ['página', 'impr.', 'clics', 'pos.'],
      pages.map((r) => [shorten(r.keys[0]), String(r.impressions), String(r.clicks), pos(r.position)]),
    );

    heading('Search Console · países');
    table(
      ['país', 'impr.', 'clics', 'pos.'],
      countries.map((r) => [
        r.keys[0].toUpperCase(),
        String(r.impressions),
        String(r.clicks),
        pos(r.position),
      ]),
    );
  }

  // --- GA4 -----------------------------------------------------------------
  const [audience, byCountry, byPage, events] = await Promise.all([
    ga4([], ['activeUsers', 'sessions', 'screenPageViews'], period, 1),
    ga4(['country'], ['activeUsers', 'sessions'], period, 10),
    ga4(['pagePath'], ['screenPageViews', 'activeUsers'], period, 15),
    ga4(['eventName'], ['eventCount'], period, 25),
  ]);

  // `source` es un parámetro del evento cv_download: solo se puede consultar si
  // está registrado como dimensión personalizada en GA4. Si no lo está, la API
  // rechaza la dimensión entera, así que se pregunta aparte.
  let cvBySource = null;
  let cvHint = null;
  try {
    cvBySource = await ga4(['customEvent:source'], ['eventCount'], period, 10);
  } catch (err) {
    cvHint = err.message;
  }

  report.ga4 = { audience: audience[0]?.values ?? null, byCountry, byPage, events, cvBySource };

  if (AS_JSON) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  heading('GA4 · audiencia');
  if (!audience[0] || !audience[0].values[0]) {
    console.log(`${DIM}Sin visitas registradas en el período.${OFF}`);
  } else {
    const [users, sessions, views] = audience[0].values;
    table(
      ['', 'valor'],
      [
        ['Usuarios', String(users)],
        ['Sesiones', String(sessions)],
        ['Vistas de página', String(views)],
      ],
    );
  }

  heading('GA4 · países');
  table(
    ['país', 'usuarios', 'sesiones'],
    byCountry.map((r) => [r.keys[0], String(r.values[0]), String(r.values[1])]),
  );

  heading('GA4 · páginas');
  table(
    ['ruta', 'vistas', 'usuarios'],
    byPage.map((r) => [shorten(r.keys[0]), String(r.values[0]), String(r.values[1])]),
  );

  heading('GA4 · eventos');
  table(
    ['evento', 'cantidad'],
    events.map((r) => [r.keys[0], String(r.values[0])]),
  );

  heading('GA4 · descargas del CV por versión');
  if (cvBySource) {
    table(
      ['source', 'descargas'],
      cvBySource.map((r) => [r.keys[0] || '(sin valor)', String(r.values[0])]),
    );
  } else {
    console.log(
      `${DIM}No disponible: registrá "source" como dimensión personalizada de\n` +
        `evento en GA4 (Administrar → Definiciones personalizadas) para separar\n` +
        `el CV resumido del extendido.\n${cvHint}${OFF}`,
    );
  }

  console.log('');
}

main().catch((err) => {
  console.error(`\n${err.message}\n`);
  if (err.status === 403) {
    console.error(
      'Un 403 casi siempre es acceso, no credenciales: revisá que\n' +
        `${creds.client_email}\nesté agregada en GA4 (Lector) y en Search Console (Restringido).\n`,
    );
  }
  process.exit(1);
});
