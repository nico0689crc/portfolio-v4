import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';

import { getCvFiles, getPostSlugMap, getProjectSlugMap } from '@/lib/content';
import { getRouteTimestamps } from '@/lib/content/last-modified';
import { SITE_URL, localizedUrl, type LocalizedHref } from '@/lib/seo';

type Entry = {
  href: LocalizedHref;
  /** Cuándo cambió el contenido de esta ruta, en ISO. */
  lastModified: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
};

/** Las rutas fijas y su prioridad; la fecha se resuelve por ruta al construir. */
const STATIC_ROUTES = [
  { href: '/', priority: 1, changeFrequency: 'monthly' },
  { href: '/portfolio', priority: 0.9, changeFrequency: 'monthly' },
  { href: '/about', priority: 0.8, changeFrequency: 'monthly' },
  { href: '/resume', priority: 0.8, changeFrequency: 'monthly' },
  { href: '/contact', priority: 0.6, changeFrequency: 'yearly' },
  { href: '/privacy', priority: 0.2, changeFrequency: 'yearly' },
] as const;

/**
 * Runs at build time with no request context, so every read here goes through
 * the content layer's cookieless client.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fechas reales por ruta en lugar de la hora del build: Google ignora un
  // `lastmod` que reconoce como fecha de compilación, y con eso se pierde la
  // señal de que algo cambió.
  const [cvFiles, stamps] = await Promise.all([getCvFiles(), getRouteTimestamps()]);

  // Both the sitemap and the project page now resolve slugs from the content
  // layer, which is the only way they cannot drift: a sitemap listing a slug
  // the page can't render is a 404 in the index.
  //
  // Projects missing a slug in any locale are skipped rather than guessed. Each
  // <url> below carries the full hreflang set, so emitting one for a language
  // that has no page would advertise a URL that 404s.
  const staticEntries: Entry[] = STATIC_ROUTES.map((route) => ({
    ...route,
    lastModified: stamps.pages[route.href] ?? stamps.latest,
  }));

  const slugMap = await getProjectSlugMap();
  const projectEntries: Entry[] = slugMap
    .filter((entry) => routing.locales.every((locale) => entry.slugs[locale]))
    .map((entry) => ({
      href: (locale: string) => ({
        pathname: '/projects/[slug]' as const,
        params: { slug: entry.slugs[locale] },
      }),
      priority: 0.8,
      changeFrequency: 'yearly' as const,
      lastModified: stamps.projects[entry.key] ?? stamps.latest,
    }));

  // The PDF CVs are indexable documents in their own right, and each is the
  // language alternate of the other.
  // El CV se regenera desde la base, así que su fecha es la del contenido que
  // lo compone y no la del archivo.
  const cvEntries: MetadataRoute.Sitemap = Object.values(cvFiles).map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: stamps.pages['/resume'],
    changeFrequency: 'yearly' as const,
    priority: 0.5,
    alternates: {
      languages: Object.fromEntries(
        Object.entries(cvFiles).map(([l, p]) => [l, `${SITE_URL}${p}`])
      )
    }
  }));

  // El listado del blog entra sólo si hay algo que listar. Un <url> a una página
  // vacía es una invitación a que Google la indexe como thin content y arrastre
  // la reputación del resto del dominio.
  const postMap = await getPostSlugMap();
  const publishedPosts = postMap.filter((entry) =>
    routing.locales.every((locale) => entry.slugs[locale])
  );

  const blogEntries: Entry[] =
    publishedPosts.length === 0
      ? []
      : [
          {
            href: '/blog',
            priority: 0.7,
            changeFrequency: 'weekly' as const,
            lastModified: stamps.pages['/blog'] ?? stamps.latest,
          },
          ...publishedPosts.map((entry) => ({
            href: (locale: string) => ({
              pathname: '/blog/[slug]' as const,
              params: { slug: entry.slugs[locale] },
            }),
            priority: 0.6,
            changeFrequency: 'yearly' as const,
            lastModified: stamps.posts[entry.key] ?? stamps.latest,
          })),
        ];

  // One <url> per locale, each carrying the full hreflang set. URLs come from
  // next-intl so localized segments and `as-needed` prefixing can't drift out
  // of sync with the routing config.
  const pageEntries = [...staticEntries, ...projectEntries, ...blogEntries].flatMap(
    ({ href, priority, changeFrequency, lastModified }) => {
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
