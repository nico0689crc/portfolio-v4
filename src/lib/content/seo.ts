import { supabasePublic } from '@/lib/supabase/public';
import { cached } from './cache';
import { TAGS } from './tags';
import { localesFor, pick } from './internal';
import type { PageSeo } from './types';

/**
 * Editable per-page SEO: title, description, OG image, and a `noindex` flag.
 *
 * Canonical and hreflang are NOT here and never will be. They stay computed
 * from `routing` via `buildAlternates`, because a hand-edited canonical is how
 * every page in one language ends up pointing at another language's URL and
 * de-indexing itself. `noindex` is safe by contrast: it can only ever
 * restrict, never point somewhere wrong.
 */
export const getPageSeo = cached(
  async (routeKey: string, locale: string): Promise<PageSeo | null> => {
    const { data, error } = await supabasePublic
      .from('page_seo')
      .select(
        `route_key,
         page_seo_translations(locale, title, description, og_image, noindex)`
      )
      .eq('route_key', routeKey)
      .in('page_seo_translations.locale', localesFor(locale))
      .maybeSingle();

    if (error) throw new Error(`content/getPageSeo: ${error.message}`);
    if (!data) return null;

    const t = pick(data.page_seo_translations, locale);
    if (!t) return null;

    return {
      routeKey: data.route_key,
      title: t.title,
      description: t.description,
      ogImage: t.og_image,
      noindex: t.noindex
    };
  },
  ['page-seo'],
  [TAGS.seo, TAGS.all]
);
