import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import About from '@/components/pages/about';
import { JsonLd } from '@/components/seo/json-ld';
import {
  PERSON_ID,
  breadcrumbSchema,
  faqSchema,
  jsonLdGraph,
  localizedUrl,
} from '@/lib/seo';
import { getPageSeo } from '@/lib/content';
import { pageMetadata } from '@/lib/page-metadata';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;

  return pageMetadata({
    locale,
    routeKey: '/about',
    href: '/about',
    type: 'profile'
  });
}

export default async function SobreMiPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  // El mismo origen que `generateMetadata`: si el JSON-LD describiera algo
  // distinto de lo que dice el <head>, Google usa uno de los dos sin avisar.
  const seo = await getPageSeo('/about', locale);
  const t = await getTranslations({ locale, namespace: 'Metadata' });
  const tAbout = await getTranslations({ locale, namespace: 'About' });
  const tHeader = await getTranslations({ locale, namespace: 'Header' });

  // The page already renders a real FAQ accordion — mirroring it as FAQPage
  // makes it eligible for expandable FAQ rich results.
  const questions = tAbout.raw('faq.questions') as Array<{ q: string; a: string }>;

  const schema = jsonLdGraph(
    {
      '@type': 'ProfilePage',
      '@id': `${localizedUrl(locale, '/about')}#profilepage`,
      url: localizedUrl(locale, '/about'),
      name: seo?.title ?? t('defaultTitle'),
      description: seo?.description ?? t('defaultDescription'),
      inLanguage: locale,
      mainEntity: { '@id': PERSON_ID },
    },
    faqSchema(questions),
    breadcrumbSchema([
      { name: tHeader('home'), url: localizedUrl(locale, '/') },
      { name: tHeader('about'), url: localizedUrl(locale, '/about') },
    ])
  );

  return (
    <>
      <About />
      <JsonLd data={schema} />
    </>
  );
}
