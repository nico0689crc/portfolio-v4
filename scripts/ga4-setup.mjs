#!/usr/bin/env node
/**
 * Configura GA4 para que los eventos del sitio se puedan analizar.
 *
 * GA4 recibe los parámetros de cada evento igual, pero no los deja usar como
 * columna en los informes hasta que existen como dimensión personalizada, y
 * solo cuenta desde el momento en que se crean: lo anterior queda perdido. Por
 * eso conviene correr esto antes de tener tráfico, no después.
 *
 * La lista sale del catálogo de eventos de src/lib/analytics.ts. Si ahí se
 * agrega un parámetro nuevo que valga la pena segmentar, se agrega acá.
 *
 * Idempotente: consulta lo que ya existe y solo crea lo que falta, así que se
 * puede volver a correr sin duplicar nada.
 *
 * Necesita permiso de Editor en la propiedad, a diferencia del informe, que
 * lee con Lector. Conviene subir el permiso, correr esto y volver a bajarlo:
 * el acceso permanente de la clave debería ser de solo lectura.
 *
 *   node scripts/ga4-setup.mjs [--dry]
 */

import { loadEnv, accessToken, request, heading, table, DIM, GREEN, OFF } from './lib/google.mjs';

loadEnv();

const DRY = process.argv.includes('--dry');
const PROPERTY = (process.env.GA4_PROPERTY_ID ?? '').replace(/^properties\//, '');

if (!PROPERTY) {
  console.error('Falta GA4_PROPERTY_ID en .env');
  process.exit(1);
}

const API = `https://analyticsadmin.googleapis.com/v1beta/properties/${PROPERTY}`;

/**
 * Parámetros que vale la pena segmentar, con el evento que los emite.
 *
 * `from` y `to` de language_switch quedan afuera a propósito: la cantidad de
 * cambios de idioma ya se ve en el evento, y dos dimensiones más para saber la
 * dirección no cambian ninguna decisión.
 */
const DIMENSIONS = [
  ['source', 'Origen de la descarga', 'Desde qué parte del sitio se disparó (home, about, resume, resume_extended, portfolio, case_study)'],
  ['file_language', 'Idioma del CV', 'Idioma del PDF descargado'],
  ['project', 'Proyecto', 'Proyecto del portafolio sobre el que se hizo clic'],
  ['link_type', 'Tipo de enlace', 'Recurso externo del proyecto (demo, github, canva, figjam, lofi)'],
  ['status', 'Resultado del contacto', 'Si el envío del formulario salió bien o falló'],
  ['network', 'Red social', 'Red del enlace social (linkedin, github, email)'],
];

/** Lo que cuenta como conversión: bajar el CV o escribir. Nada más. */
const KEY_EVENTS = ['cv_download', 'contact_submit'];

async function main() {
  const token = await accessToken(['https://www.googleapis.com/auth/analytics.edit']);

  // --- Dimensiones personalizadas -----------------------------------------
  const existing = await request(token, `${API}/customDimensions?pageSize=200`);
  const known = new Set((existing.customDimensions ?? []).map((d) => d.parameterName));

  heading('Dimensiones personalizadas');
  const dimRows = [];

  for (const [parameterName, displayName, description] of DIMENSIONS) {
    if (known.has(parameterName)) {
      dimRows.push([parameterName, `${DIM}ya existía${OFF}`]);
      continue;
    }
    if (DRY) {
      dimRows.push([parameterName, 'se crearía']);
      continue;
    }
    await request(token, `${API}/customDimensions`, {
      parameterName,
      displayName,
      description,
      scope: 'EVENT',
    });
    dimRows.push([parameterName, `${GREEN}creada${OFF}`]);
  }
  table(['parámetro', 'estado'], dimRows);

  // --- Eventos clave -------------------------------------------------------
  // keyEvents reemplazó a conversionEvents en 2024; algunas propiedades viejas
  // todavía responden por el nombre anterior.
  let collection = 'keyEvents';
  let current;
  try {
    current = await request(token, `${API}/keyEvents?pageSize=200`);
  } catch (err) {
    if (err.status !== 404) throw err;
    collection = 'conversionEvents';
    current = await request(token, `${API}/conversionEvents?pageSize=200`);
  }

  const marked = new Set((current[collection] ?? []).map((e) => e.eventName));

  heading('Eventos clave');
  const eventRows = [];

  for (const eventName of KEY_EVENTS) {
    if (marked.has(eventName)) {
      eventRows.push([eventName, `${DIM}ya estaba${OFF}`]);
      continue;
    }
    if (DRY) {
      eventRows.push([eventName, 'se marcaría']);
      continue;
    }
    await request(token, `${API}/${collection}`, {
      eventName,
      countingMethod: 'ONCE_PER_EVENT',
    });
    eventRows.push([eventName, `${GREEN}marcado${OFF}`]);
  }
  table(['evento', 'estado'], eventRows);

  console.log(
    DRY
      ? `\n${DIM}Simulación: no se escribió nada. Sacá --dry para aplicarlo.${OFF}\n`
      : `\n${DIM}Listo. Ya podés volver a bajar la cuenta de servicio a Lector.${OFF}\n`,
  );
}

main().catch((err) => {
  console.error(`\n${err.message}\n`);
  if (err.status === 403) {
    console.error(
      'Un 403 acá es permiso de escritura: la cuenta de servicio necesita\n' +
        'Editor en la propiedad, y la Google Analytics Admin API tiene que\n' +
        'estar habilitada en el proyecto de Cloud.\n',
    );
  }
  process.exit(1);
});
