/**
 * Public URLs that used to exist and must keep resolving.
 *
 * Changing a slug orphans whatever Google already indexed under the old one,
 * so every rename lands here as a permanent redirect instead of a 404. Kept
 * free of image or i18n imports so `next.config.ts` can read it directly.
 *
 * REMOVAL ORDER — do not delete these two entries early. They are the only
 * thing keeping the old ES project URLs alive right now. The same pairs are
 * seeded into Supabase `slug_redirects`; once the lazy resolution on the 404
 * path is live AND its 308s are verified against the database, these can go.
 * Removing them before that leaves two indexed URLs returning 404.
 *
 * Keeping a rename in both places long-term is also wrong: the trigger that
 * flattens redirect chains (A->B then B->C becomes A->C) cannot rewrite a row
 * it does not own, so a second rename would silently produce a two-hop chain.
 *
 * What stays here permanently: moves that are not slug renames — a changed
 * pathname, a relocated section. No database trigger covers those.
 */
export const legacyRedirects: Array<{ source: string; destination: string }> = [
  // ES slugs translated on 2026-09-05. Both old paths were live and indexed,
  // so they redirect rather than 404 and lose their accumulated ranking.
  {
    source: '/es/proyectos/mexx-ux-redesign',
    destination: '/es/proyectos/rediseno-ux-ui-ecommerce-mexx'
  },
  {
    source: '/es/proyectos/gym-smart-access',
    destination: '/es/proyectos/gymsmartaccess-gestion-gimnasios'
  }
];
