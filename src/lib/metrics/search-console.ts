/**
 * Consultas a Search Console: qué busca la gente y qué ve de este sitio.
 *
 * Search Console guarda 16 meses. Más atrás no existe, así que ningún período
 * pedido acá puede pasar de ahí.
 */

import { apiPost, type MetricsConfig } from './client';

export type DateRange = { start: string; end: string };

export type SearchTotals = {
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

export type SearchRow = SearchTotals & { key: string };

type ApiRow = { keys?: string[]; clicks: number; impressions: number; ctr: number; position: number };

async function query(
  config: MetricsConfig,
  dimensions: string[],
  range: DateRange,
  rowLimit: number
): Promise<ApiRow[]> {
  const url = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(
    config.searchConsoleSite
  )}/searchAnalytics/query`;

  const body = await apiPost<{ rows?: ApiRow[] }>(config, url, {
    startDate: range.start,
    endDate: range.end,
    dimensions,
    rowLimit,
    // 'all' incluye los días todavía incompletos. Sin esto los últimos dos o
    // tres días simplemente no existen, y un período corto miente hacia abajo.
    dataState: 'all',
  });

  return body.rows ?? [];
}

const toRows = (rows: ApiRow[]): SearchRow[] =>
  rows.map(row => ({
    key: row.keys?.[0] ?? '',
    clicks: row.clicks,
    impressions: row.impressions,
    ctr: row.ctr,
    position: row.position,
  }));

export async function searchConsoleReport(
  config: MetricsConfig,
  period: DateRange,
  previous: DateRange
) {
  const [totals, before, queries, pages, countries] = await Promise.all([
    query(config, [], period, 1),
    query(config, [], previous, 1),
    query(config, ['query'], period, 25),
    query(config, ['page'], period, 25),
    query(config, ['country'], period, 10),
  ]);

  return {
    totals: (totals[0] as SearchTotals | undefined) ?? null,
    previous: (before[0] as SearchTotals | undefined) ?? null,
    queries: toRows(queries),
    pages: toRows(pages),
    countries: toRows(countries),
  };
}

export type SearchConsoleReport = Awaited<ReturnType<typeof searchConsoleReport>>;
