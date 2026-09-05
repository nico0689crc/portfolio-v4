import { unstable_cache, revalidateTag, updateTag } from 'next/cache';

/**
 * The single place that decides HOW content reads are cached and invalidated.
 *
 * `unstable_cache` and not the `use cache` directive: `cacheTag`/`cacheLife`
 * require `cacheComponents: true` in next.config, and turning that on makes
 * every uncached dynamic access an error across the whole project. Verified in
 * next@16.1.6 that `unstable_cache` is still exported and carries no
 * `@deprecated` marker, so there is no rush. When `cacheComponents` is
 * eventually enabled, only this file changes.
 */
export function cached<A extends unknown[], R>(
  fn: (...args: A) => Promise<R>,
  keyParts: string[],
  tags: string[]
): (...args: A) => Promise<R> {
  // The arguments are part of the cache key on top of `keyParts`, which is what
  // keeps one tag serving every locale correctly.
  return unstable_cache(fn, keyParts, { tags });
}

/**
 * Same as `cached`, but for reads whose tag depends on the locale.
 *
 * `unstable_cache` fixes its tags when the function is wrapped, not when it is
 * called, so a per-locale tag cannot come from the arguments. One wrapper per
 * locale is memoised instead.
 *
 * This exists because the alternative is worse in a way that fails silently: a
 * literal tag like `messages:*` looks per-locale, is accepted by
 * `unstable_cache`, and matches nothing — the read would simply never
 * invalidate, and the backoffice would appear to save without the site
 * changing.
 */
export function cachedPerLocale<R>(
  fn: (locale: string) => Promise<R>,
  keyParts: string[],
  tagsFor: (locale: string) => string[]
): (locale: string) => Promise<R> {
  const wrapped = new Map<string, (locale: string) => Promise<R>>();
  return (locale: string) => {
    let f = wrapped.get(locale);
    if (!f) {
      f = unstable_cache(fn, [...keyParts, locale], { tags: tagsFor(locale) });
      wrapped.set(locale, f);
    }
    return f(locale);
  };
}

/**
 * Invalidate from a Server Action — the backoffice's save path.
 *
 * `updateTag` gives read-your-own-writes: the editor who just saved is
 * guaranteed to see their own change on the next read, instead of possibly
 * being served the stale version while it regenerates.
 *
 * Verified in next@16.1.6: it throws E872 when `workStore.page` ends in
 * `/route`, so it is unusable from Route Handlers — use `purgeTags` there.
 */
export function updateTags(tags: readonly string[]): void {
  for (const tag of tags) updateTag(tag);
}

/**
 * Invalidate from anywhere that is not a Server Action: Route Handlers,
 * webhooks, scripts. No read-your-own-writes guarantee.
 *
 * The `'max'` profile is required, not decorative: `revalidateTag(tag)` with a
 * single argument is deprecated in 16.1.6 and logs a warning on every call.
 */
export function purgeTags(tags: readonly string[]): void {
  for (const tag of tags) revalidateTag(tag, 'max');
}
