import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import Projects from '@/components/pages/portfolio';
import { JsonLd } from '@/components/seo/json-ld';
import { getPageSeo, getProjects } from '@/lib/content';
import {
  PERSON_ID,
  breadcrumbSchema,
  jsonLdGraph,
  localizedUrl,
} from '@/lib/seo';
import { pageMetadata } from '@/lib/page-metadata';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;

  return pageMetadata({
    locale,
    routeKey: '/portfolio',
    href: '/portfolio',
    fallbackImage: `/og/portfolio-${locale}.png`
  });
}

export default async function PortafolioPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  // El mismo origen que `generateMetadata`: si el JSON-LD describiera algo
  // distinto de lo que dice el <head>, Google usa uno de los dos sin avisar.
  const seo = await getPageSeo('/portfolio', locale);
  const t = await getTranslations({ locale, namespace: 'Metadata' });
  const tHeader = await getTranslations({ locale, namespace: 'Header' });
  const projects = await getProjects(locale);

  const schema = jsonLdGraph(
    {
      '@type': 'CollectionPage',
      '@id': `${localizedUrl(locale, '/portfolio')}#collectionpage`,
      url: localizedUrl(locale, '/portfolio'),
      name: seo?.title ?? t('defaultTitle'),
      description: seo?.description ?? t('defaultDescription'),
      inLanguage: locale,
      about: { '@id': PERSON_ID },
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: projects.map((project, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          // The slug is already the one for this locale, so no lookup is needed.
          url: localizedUrl(locale, {
            pathname: '/projects/[slug]',
            params: { slug: project.slug },
          }),
          name: project.title,
        })),
      },
    },
    breadcrumbSchema([
      { name: tHeader('home'), url: localizedUrl(locale, '/') },
      { name: tHeader('portfolio'), url: localizedUrl(locale, '/portfolio') },
    ])
  );

  return (
    <>
      <Projects projects={projects} />
      <JsonLd data={schema} />
    </>
  );
}
