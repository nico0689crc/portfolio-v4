/**
 * Cache tags for every DB-backed read.
 *
 * Constants rather than loose strings so a typo can't silently produce a tag
 * nothing invalidates — a read cached under a misspelled tag never refreshes
 * and the backoffice looks broken with no error anywhere.
 *
 * The locale is NOT part of a tag, except for `messages:<locale>`. Two reasons:
 * `unstable_cache` already includes the function's arguments in its cache key,
 * so `getExperiences('es')` and `getExperiences('en')` are separate entries
 * sharing one tag; and the bilingual editor saves every locale in a single
 * transaction, so a per-locale tag would only add a way to forget one and
 * leave the languages inconsistent. `messages` is the exception because the
 * whole tree is assembled per language and is the most expensive thing to
 * rebuild.
 */
export const TAGS = {
  /** Root tag carried by every read. `updateTags([TAGS.all])` refreshes all. */
  all: 'content',

  messages: (locale: string) => `messages:${locale}`,

  projects: 'projects',
  project: (key: string) => `project:${key}`,

  posts: 'posts',
  post: (key: string) => `post:${key}`,
  tags: 'tags',

  experiences: 'experiences',
  education: 'education',
  certifications: 'certifications',
  skills: 'skills',
  faqs: 'faqs',
  highlights: 'resume-highlights',

  seo: 'seo',
  seoRoute: (routeKey: string) => `seo:${routeKey}`,

  settings: 'settings'
} as const;
