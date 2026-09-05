import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['es', 'en'],
  defaultLocale: 'en',
  localePrefix: 'as-needed',
  // No Accept-Language redirects: every URL always serves its own language.
  // hreflang already tells Google which version to surface per user, and an
  // unconditional response keeps each URL cacheable and unambiguous to crawlers.
  localeDetection: false,
  pathnames: {
    '/': '/',
    '/about': {
      en: '/about',
      es: '/sobre-mi'
    },
    '/portfolio': {
      en: '/portfolio',
      es: '/portafolio'
    },
    '/resume': {
      en: '/resume',
      es: '/curriculum'
    },
    '/contact': {
      en: '/contact',
      es: '/contacto'
    },
    '/projects/[slug]': {
      en: '/projects/[slug]',
      es: '/proyectos/[slug]'
    }
  }
});

// Use the configured routing to create navigation wrappers.
// `permanentRedirect` is exported because renamed slugs must resolve with a 308:
// next/navigation's `redirect()` emits 307, which Google reads as temporary and
// which therefore neither retires the old URL nor transfers its ranking.
export const {
  Link,
  redirect,
  permanentRedirect,
  usePathname,
  useRouter,
  getPathname
} = createNavigation(routing);

export type AppPathname = keyof typeof routing.pathnames;
