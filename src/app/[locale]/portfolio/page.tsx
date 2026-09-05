import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import Projects from '@/components/pages/portfolio';
import { JsonLd } from '@/components/seo/json-ld';
import { projectHref, projects } from '@/data/projectsData';
import {
  PERSON_ID,
  breadcrumbSchema,
  buildPageMetadata,
  jsonLdGraph,
  localizedUrl,
} from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  return buildPageMetadata({
    locale,
    href: '/portfolio',
    title: t('portfolioTitle'),
    description: t('portfolioDescription'),
    image: '/og/default.png',
  });
}

export default async function PortafolioPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'Metadata' });
  const tHeader = await getTranslations({ locale, namespace: 'Header' });
  const tPortfolio = await getTranslations({ locale, namespace: 'Portfolio' });

  const schema = jsonLdGraph(
    {
      '@type': 'CollectionPage',
      '@id': `${localizedUrl(locale, '/portfolio')}#collectionpage`,
      url: localizedUrl(locale, '/portfolio'),
      name: t('portfolioTitle'),
      description: t('portfolioDescription'),
      inLanguage: locale,
      about: { '@id': PERSON_ID },
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: projects.map((project, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          url: localizedUrl(locale, projectHref(project, locale)),
          name: tPortfolio(project.titleKey as Parameters<typeof tPortfolio>[0]),
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
      <Projects />
      <JsonLd data={schema} />
    </>
  );
}
