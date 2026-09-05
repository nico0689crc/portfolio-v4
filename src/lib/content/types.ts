/**
 * Domain types returned by the content layer.
 *
 * Deliberately shaped like the static `src/data/*.ts` records they replace, so
 * swapping a consumer over is a change of import rather than a rewrite. Dates
 * are `YYYY-MM` strings for the same reason: that is what the JSON-LD and JSON
 * Resume builders already expect, and the underlying data is month-precision —
 * emitting a day would be inventing one.
 */

export interface Experience {
  id: string;
  organization: string;
  location: string;
  employmentType: string;
  remote: boolean;
  techs: string[];
  /** `YYYY-MM`. Outer span; orders the list. */
  startDate: string | null;
  /** `null` while current. */
  endDate: string | null;
  /**
   * Discrete stretches when the position was interrupted, `undefined` when it
   * ran continuously. Structured data must read this rather than the span: the
   * visible label shows the gap, and markup has to match what the page says.
   */
  periods?: Array<{ startDate: string; endDate: string | null }>;
  role: string;
  /**
   * Visible employer label, translated prose — "Autónomo - Corrientes,
   * Argentina" where `organization` says "Self-employed". Render this; use
   * `organization` and `location` for structured data.
   */
  company: string;
  /** Editorial prose per language, not a format of the dates. */
  dateLabel: string;
  description: string;
}

export interface Education {
  id: string;
  institution: string;
  url?: string;
  startDate: string | null;
  endDate: string | null;
  degree: string;
  dateLabel: string;
  location: string | null;
}

export interface Certification {
  id: string;
  issuer: string;
  year: number;
  url?: string;
  name: string;
}

export interface Skill {
  name: string;
  /** False for proper nouns identical in every language (React, Docker). */
  isTranslatable: boolean;
}

export interface SkillCategory {
  id: string;
  slug: string;
  label: string;
  skills: Skill[];
}

export interface Highlight {
  id: string;
  label: string;
  value: string;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
}

export interface ProjectLinks {
  github?: string;
  demo?: string;
  canva?: string;
  figjam?: string;
  lofi?: string;
}

export interface ProjectSummary {
  /** Stable identity, NOT a URL. Analytics and OG filenames key off this. */
  key: string;
  /** URL slug for the requested locale. */
  slug: string;
  category: string;
  techs: string[];
  links: ProjectLinks;
  ogImage: string | null;
  title: string;
  description: string;
  noindex: boolean;
  /** Ordered; the portfolio card renders these as a carousel. */
  images: ProjectImage[];
}

export interface CasePhase {
  slug: string;
  label: string | null;
  title: string | null;
  body: string | null;
}

export interface CaseMetric {
  /** The headline figure: "+15%", "85.7%", "Zero". */
  value: string;
  label: string;
}

export interface CaseStudy {
  overview: string | null;
  role: string | null;
  duration: string | null;
  team: string | null;
  context: string | null;
  problem: string | null;
  processDesc: string | null;
  results: string | null;
  learnings: string | null;
  noteHtml: string | null;
  noteUrl: string | null;
  noteLinkText: string | null;
  phases: CasePhase[];
  metrics: CaseMetric[];
}

export interface ProjectImage {
  storagePath: string;
  width: number;
  height: number;
  blurDataUrl: string | null;
  alt: string | null;
}

export interface ProjectDetail extends ProjectSummary {
  seoTitle: string | null;
  seoDescription: string | null;
  images: ProjectImage[];
  caseStudy: CaseStudy | null;
}

export interface PostSummary {
  key: string;
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string | null;
  /** Feeds `dateModified`; set deliberately, not by every save. */
  contentUpdatedAt: string | null;
  readingMinutes: number | null;
  coverPath: string | null;
  coverWidth: number | null;
  coverHeight: number | null;
  noindex: boolean;
}

export interface PostDetail extends PostSummary {
  body: string;
  wordCount: number | null;
  coverBlurDataUrl: string | null;
  tags: Tag[];
}

export interface Tag {
  key: string;
  slug: string;
  name: string;
}

export interface PageSeo {
  routeKey: string;
  title: string;
  description: string;
  ogImage: string | null;
  noindex: boolean;
}

/** `{ en: 'slug-en', es: 'slug-es' }` for one entity. */
export interface SlugMapEntry {
  key: string;
  slugs: Record<string, string>;
}
