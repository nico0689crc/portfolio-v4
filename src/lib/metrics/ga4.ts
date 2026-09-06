/**
 * Consultas a GA4: de dónde viene la gente y qué hace.
 *
 * Los parámetros de evento (`source`, `file_language`) solo se pueden pedir
 * como `customEvent:*` si están registrados como dimensión personalizada en la
 * propiedad. Eso lo hace scripts/ga4-setup.mjs, y cuentan desde que se crean:
 * un período anterior a su creación devuelve `(not set)`.
 */

import { apiPost, type MetricsConfig } from './client';
import type { DateRange } from './search-console';

export type Ga4Row = { keys: string[]; values: number[] };

type ApiResponse = {
  rows?: { dimensionValues?: { value: string }[]; metricValues?: { value: string }[] }[];
};

async function runReport(
  config: MetricsConfig,
  dimensions: string[],
  metrics: string[],
  range: DateRange,
  limit: number,
  eventName?: string
): Promise<Ga4Row[]> {
  const url = `https://analyticsdata.googleapis.com/v1beta/properties/${config.ga4Property}:runReport`;

  const body = await apiPost<ApiResponse>(config, url, {
    dateRanges: [{ startDate: range.start, endDate: range.end }],
    dimensions: dimensions.map(name => ({ name })),
    metrics: metrics.map(name => ({ name })),
    limit,
    // Sin este filtro la consulta suma todos los eventos de la propiedad, no
    // los del evento que se está mirando.
    ...(eventName
      ? { dimensionFilter: { filter: { fieldName: 'eventName', stringFilter: { value: eventName } } } }
      : {}),
  });

  return (body.rows ?? []).map(row => ({
    keys: (row.dimensionValues ?? []).map(d => d.value),
    values: (row.metricValues ?? []).map(m => Number(m.value)),
  }));
}

export async function ga4Report(config: MetricsConfig, period: DateRange, previous: DateRange) {
  const [audience, before, countries, pages, events] = await Promise.all([
    runReport(config, [], ['activeUsers', 'sessions', 'screenPageViews'], period, 1),
    runReport(config, [], ['activeUsers', 'sessions', 'screenPageViews'], previous, 1),
    runReport(config, ['country'], ['activeUsers', 'sessions'], period, 10),
    runReport(config, ['pagePath'], ['screenPageViews', 'activeUsers'], period, 15),
    runReport(config, ['eventName'], ['eventCount'], period, 25),
  ]);

  // La dimensión puede no existir todavía en la propiedad: es configuración
  // manual, no algo que el código garantice. Si falta, el resto del informe
  // vale igual.
  let cvBySource: Ga4Row[] | null = null;

  try {
    cvBySource = await runReport(
      config,
      ['customEvent:source', 'customEvent:file_language'],
      ['eventCount'],
      period,
      10,
      'cv_download'
    );
  } catch {
    cvBySource = null;
  }

  return {
    audience: audience[0]?.values ?? null,
    previous: before[0]?.values ?? null,
    countries,
    pages,
    events,
    cvBySource,
  };
}

export type Ga4Report = Awaited<ReturnType<typeof ga4Report>>;
