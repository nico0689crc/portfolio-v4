/**
 * The content layer: every read of site content goes through here.
 *
 * All reads use the cookieless Supabase client, so they work during the build,
 * inside `sitemap.ts` and `robots.ts`, and in Route Handlers — none of which
 * have a request context — and they are all cached and tagged. Consumers never
 * touch a Supabase client directly.
 *
 * Ordering is part of the contract: every collection is ordered by
 * `sort_order` ascending, seeded newest-first, so `getExperiences()[0]` is the
 * current role. Do not re-sort in consumers.
 */

export type * from './types';

export {
  getCertifications,
  getYearsOfExperience,
  getEducation,
  getExperiences,
  getFaqs,
  getResumeHighlights,
  getSkillCategories,
  getTechnicalSkills
} from './resume';

export { getProject, getProjectSlugMap, getProjects, getRedirectedSlug } from './projects';
export { BUCKETS, DEFAULT_COVER, coverSrc, storageUrl } from './storage';

export { getPost, getPostSlugMap, getPosts, getTags } from './posts';

export { getPageSeo } from './seo';

export {
  getContactEmail,
  getCvFiles,
  getSetting,
  getSocialLinks
} from './settings';

export { getMessageTree } from './messages';

export { TAGS } from './tags';
export { purgeTags, updateTags } from './cache';
