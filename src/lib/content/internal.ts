import { routing } from '@/i18n/routing';

/**
 * Shared internals for the content layer. Not part of the public contract.
 */

export const FALLBACK_LOCALE = routing.defaultLocale;

/**
 * Locales to fetch for a request. Always includes the default one so a missing
 * translation degrades to the other language instead of rendering a blank page
 * or 404 — a half-translated locale must never take a route down.
 */
export function localesFor(locale: string): string[] {
  return locale === FALLBACK_LOCALE ? [locale] : [locale, FALLBACK_LOCALE];
}

/** The row for `locale`, falling back to the default locale's. */
export function pick<T extends { locale: string }>(
  rows: T[] | null | undefined,
  locale: string
): T | undefined {
  if (!rows?.length) return undefined;
  return rows.find((r) => r.locale === locale) ?? rows.find((r) => r.locale === FALLBACK_LOCALE);
}

/** Postgres `date` (`YYYY-MM-DD`) to the `YYYY-MM` consumers expect. */
export function toYearMonth(value: string | null): string | null {
  return value ? value.slice(0, 7) : null;
}

/** Fails loudly: a silent empty result would render a page with missing content. */
export function orThrow<T>(what: string, result: { data: T | null; error: { message: string } | null }): T {
  if (result.error) throw new Error(`content/${what}: ${result.error.message}`);
  if (result.data === null) throw new Error(`content/${what}: no data`);
  return result.data;
}
