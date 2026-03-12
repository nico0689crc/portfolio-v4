import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['es', 'en'],
  defaultLocale: 'en',
  localePrefix: 'as-needed',
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

// Use the configured routing to create navigation wrappers
export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);
