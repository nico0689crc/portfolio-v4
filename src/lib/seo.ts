import type { Metadata } from 'next';
import { getPathname, routing } from '@/i18n/routing';

export const SITE_URL = 'https://nicolasarielfernandez.com';
export const SITE_NAME = 'Nicolás Ariel Fernández';
export const AUTHOR_EMAIL = 'contacto@nicolasarielfernandez.com';

export const SOCIAL_LINKS = [
  'https://www.linkedin.com/in/nicolas-ariel-fernandez',
  'https://github.com/nico0689crc'
];

/**
 * `href` as accepted by next-intl's `getPathname`. Static routes are plain
 * keys of `routing.pathnames`; dynamic ones need `{pathname, params}`.
 */
export type SeoHref = Parameters<typeof getPathname>[0]['href'];

/**
 * A route that may resolve to a different href per locale. Static routes pass a
 * plain href; routes with translated dynamic segments (project slugs, and blog
 * posts later) pass a function, because the slug itself differs by language and
 * the hreflang cluster has to point at each locale's real URL.
 */
export type LocalizedHref = SeoHref | ((locale: string) => SeoHref);

function resolveHref(href: LocalizedHref, locale: string): SeoHref {
  return typeof href === 'function' ? href(locale) : href;
}

/** Full locale tags for `<html lang>` and OpenGraph. */
const LOCALE_TAGS: Record<string, string> = {
  en: 'en_US',
  es: 'es_AR'
};

export function ogLocale(locale: string) {
  return LOCALE_TAGS[locale] ?? locale;
}

/** OG tags for the *other* locales, so scrapers know translations exist. */
export function ogAlternateLocales(locale: string) {
  return routing.locales.filter((l) => l !== locale).map(ogLocale);
}

/**
 * Absolute URL for a route in a given locale. Resolves the localized pathname
 * through next-intl so `as-needed` prefixing and localized segments (e.g.
 * `/about` vs `/es/sobre-mi`) always stay in sync with the routing config.
 */
export function localizedUrl(locale: string, href: LocalizedHref) {
  const pathname = getPathname({ href: resolveHref(href, locale), locale });
  return pathname === '/' ? SITE_URL : `${SITE_URL}${pathname}`;
}

/**
 * Canonical + hreflang set for a route. The canonical always points at the
 * *current* locale's URL — pointing every locale at one URL tells Google the
 * translations are duplicates and drops them from the index.
 */
export function buildAlternates(locale: string, href: LocalizedHref): Metadata['alternates'] {
  const languages = Object.fromEntries(
    routing.locales.map((l) => [l, localizedUrl(l, href)])
  );

  return {
    canonical: localizedUrl(locale, href),
    languages: {
      ...languages,
      'x-default': localizedUrl(routing.defaultLocale, href)
    }
  };
}

/**
 * Page metadata with canonical, hreflang and per-page OpenGraph/Twitter URLs.
 * Everything not passed here falls back to the root layout's defaults.
 */
export function buildPageMetadata({
  locale,
  href,
  title,
  description,
  image,
  type = 'website',
  noindex = false
}: {
  locale: string;
  href: LocalizedHref;
  title: string;
  description: string;
  image?: string;
  type?: 'website' | 'profile' | 'article';
  /** Content the database marks as hidden still resolves at its URL; this is
   *  what keeps it out of the index. */
  noindex?: boolean;
}): Metadata {
  const url = localizedUrl(locale, href);
  const images = image ? [{ url: image, width: 1200, height: 630, alt: title }] : undefined;

  return {
    title,
    description,
    ...(noindex ? { robots: { index: false, follow: false } } : {}),
    alternates: buildAlternates(locale, href),
    openGraph: {
      type,
      locale: ogLocale(locale),
      alternateLocale: ogAlternateLocales(locale),
      url,
      title,
      description,
      siteName: SITE_NAME,
      ...(images ? { images } : {})
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(image ? { images: [image] } : {})
    }
  };
}

/* -------------------------------------------------------------------------- */
/*                                  JSON-LD                                   */
/* -------------------------------------------------------------------------- */

export const PERSON_ID = `${SITE_URL}/#person`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

export function personSchema(locale: string, jobTitle: string, description: string) {
  return {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: SITE_NAME,
    alternateName: 'Nicolás Fernández',
    url: localizedUrl(locale, '/'),
    image: `${SITE_URL}/profile-picture.webp`,
    jobTitle,
    description,
    email: `mailto:${AUTHOR_EMAIL}`,
    sameAs: SOCIAL_LINKS,
    nationality: { '@type': 'Country', name: 'Argentina' },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Corrientes',
      addressCountry: 'AR'
    },
    knowsLanguage: ['es', 'en'],
    knowsAbout: [
      'React',
      'Next.js',
      'TypeScript',
      'Node.js',
      'Full Stack Development',
      'UX/UI Design',
      'Figma',
      'PostgreSQL',
      'MongoDB',
      'Docker',
      'AWS'
    ]
  };
}

export function webSiteSchema(locale: string, description: string) {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: localizedUrl(locale, '/'),
    name: SITE_NAME,
    description,
    inLanguage: locale,
    publisher: { '@id': PERSON_ID }
  };
}

export function breadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url
    }))
  };
}

export function faqSchema(questions: Array<{ q: string; a: string }>) {
  return {
    '@type': 'FAQPage',
    mainEntity: questions.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: {
        '@type': 'Answer',
        // Answers carry inline markup for the UI; schema.org wants plain text.
        text: a.replace(/<[^>]+>/g, '')
      }
    }))
  };
}

/** Wraps one or more schema nodes into a single `@graph` document. */
export function jsonLdGraph(...nodes: Array<Record<string, unknown>>) {
  return {
    '@context': 'https://schema.org',
    '@graph': nodes
  };
}
