import { supabasePublic } from '@/lib/supabase/public';
import { cached } from './cache';
import { TAGS } from './tags';
import { orThrow } from './internal';

/**
 * Site settings: a small key/value store for values that are editorial rather
 * than structural — social links, the contact address, the CV files, the years
 * of experience claim.
 *
 * All of these read through the cookieless client, so they work from
 * `sitemap.ts` and `robots.ts`, which run with no request context.
 */

const getAll = cached(
  async (): Promise<Record<string, unknown>> => {
    const rows = orThrow('settings', await supabasePublic.from('settings').select('key, value'));
    return Object.fromEntries(rows.map((r) => [r.key, r.value]));
  },
  ['settings'],
  [TAGS.settings, TAGS.all]
);

export async function getSetting<T>(key: string): Promise<T | null> {
  const all = await getAll();
  return (all[key] as T) ?? null;
}

/**
 * CV file URL per locale.
 *
 * Returns URLs and deliberately does not care what serves them. Today they are
 * the static PDFs in /public; if the CV becomes generated, this returns route
 * paths instead and every consumer — the sitemap's hreflang pairs, the
 * JSON-LD's `subjectOf`, the download buttons — keeps working untouched.
 */
export async function getCvFiles(): Promise<Record<string, string>> {
  return (await getSetting<Record<string, string>>('cv_files')) ?? {};
}

export async function getSocialLinks(): Promise<string[]> {
  return (await getSetting<string[]>('social_links')) ?? [];
}

export async function getContactEmail(): Promise<string | null> {
  return getSetting<string>('contact_email');
}

/**
 * An editorial claim, not a computation: the author may round down or count
 * from a different starting point, which is why it is stored rather than
 * derived from `min(start_date)`.
 */
export async function getYearsOfExperience(): Promise<number | null> {
  return getSetting<number>('years_of_experience');
}
