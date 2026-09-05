import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import { projectHref, projects } from '@/data/projectsData';
import { CV_FILES } from '@/data/cvData';
import { SITE_URL, localizedUrl, type LocalizedHref } from '@/lib/seo';

type Entry = {
  href: LocalizedHref;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
};

const staticEntries: Entry[] = [
  { href: '/', priority: 1, changeFrequency: 'monthly' },
  { href: '/portfolio', priority: 0.9, changeFrequency: 'monthly' },
  { href: '/about', priority: 0.8, changeFrequency: 'monthly' },
  { href: '/resume', priority: 0.8, changeFrequency: 'monthly' },
  { href: '/contact', priority: 0.6, changeFrequency: 'yearly' },
];

const projectEntries: Entry[] = projects.map((project) => ({
  // Per-locale href: the slug differs by language.
  href: (locale: string) => projectHref(project, locale),
  priority: 0.8,
  changeFrequency: 'yearly',
}));

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  // The PDF CVs are indexable documents in their own right, and each is the
  // language alternate of the other.
  const cvEntries: MetadataRoute.Sitemap = Object.values(CV_FILES).map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency: 'yearly' as const,
    priority: 0.5,
    alternates: {
      languages: Object.fromEntries(
        Object.entries(CV_FILES).map(([l, p]) => [l, `${SITE_URL}${p}`])
      )
    }
  }));

  // One <url> per locale, each carrying the full hreflang set. URLs come from
  // next-intl so localized segments and `as-needed` prefixing can't drift out
  // of sync with the routing config.
  const pageEntries = [...staticEntries, ...projectEntries].flatMap(
    ({ href, priority, changeFrequency }) => {
      const languages = Object.fromEntries(
        routing.locales.map((locale) => [locale, localizedUrl(locale, href)])
      );

      return routing.locales.map((locale) => ({
        url: localizedUrl(locale, href),
        lastModified,
        changeFrequency,
        priority,
        alternates: {
          languages: {
            ...languages,
            'x-default': localizedUrl(routing.defaultLocale, href),
          },
        },
      }));
    }
  );

  return [...pageEntries, ...cvEntries];
}
