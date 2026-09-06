/**
 * El informe que consume el panel: Search Console y GA4 en una sola lectura.
 *
 * Cada mitad se pide por separado y sus errores se guardan en vez de
 * propagarse. Si Search Console falla, los datos de GA4 siguen valiendo, y al
 * revés — un panel que se cae entero porque una de las dos APIs contestó mal
 * es peor que uno que muestra la mitad y dice qué pasó.
 */

import { unstable_cache } from 'next/cache';

import { metricsConfig } from './client';
import { ga4Report, type Ga4Report } from './ga4';
import { searchConsoleReport, type DateRange, type SearchConsoleReport } from './search-console';

/** Períodos ofrecidos, en días. */
export const PERIODS = [28, 90, 365] as const;

export type PeriodDays = (typeof PERIODS)[number];

export const PERIOD_LABELS: Record<PeriodDays, string> = {
  28: '28 días',
  90: '3 meses',
  365: '12 meses',
};

/**
 * Search Console guarda 16 meses. Comparar contra un período anterior que caiga
 * más atrás devolvería ceros, y un cero de "no hay datos" leído como caída del
 * 100% es exactamente el tipo de gráfico que hace tomar decisiones equivocadas.
 */
const MAX_HISTORY_DAYS = 480;

export type SeoReport = {
  period: DateRange;
  previous: DateRange | null;
  search: SearchConsoleReport | null;
  analytics: Ga4Report | null;
  errors: { search?: string; analytics?: string };
};

const day = (offset: number) =>
  new Date(Date.now() - offset * 86_400_000).toISOString().slice(0, 10);

async function buildReport(days: number): Promise<SeoReport> {
  const config = metricsConfig();

  // El llamador ya comprobó la configuración; esto es la red de seguridad.
  if (!config) throw new Error('Faltan las credenciales de medición');

  // Search Console cierra el día con dos o tres de retraso, así que el período
  // termina ayer: incluir hoy solo agrega un día vacío que baja los promedios.
  const period: DateRange = { start: day(days), end: day(1) };
  const previous: DateRange | null =
    days * 2 <= MAX_HISTORY_DAYS ? { start: day(days * 2), end: day(days + 1) } : null;

  // Sin comparación, el rango anterior no se usa; se manda el mismo para no
  // tener que ramificar cada consulta.
  const comparison = previous ?? period;

  const [search, analytics] = await Promise.all([
    searchConsoleReport(config, period, comparison).catch((err: Error) => err),
    ga4Report(config, period, comparison).catch((err: Error) => err),
  ]);

  return {
    period,
    previous,
    search: search instanceof Error ? null : search,
    analytics: analytics instanceof Error ? null : analytics,
    errors: {
      ...(search instanceof Error ? { search: search.message } : {}),
      ...(analytics instanceof Error ? { analytics: analytics.message } : {}),
    },
  };
}

/**
 * Seis horas de caché.
 *
 * No usa el helper de `lib/content/cache` porque aquello invalida por tag al
 * guardar en el panel, y acá no hay nada que guardar: el dato viene de Google y
 * se actualiza una vez por día como mucho. Pedirlo en cada visita gastaría
 * cuota para devolver siempre lo mismo.
 */
export const getSeoReport = unstable_cache(buildReport, ['seo-report'], {
  revalidate: 6 * 60 * 60,
  tags: ['seo-report'],
});

export { metricsConfig };
