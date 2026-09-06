import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import Contact from '@/components/pages/contact';
import { JsonLd } from '@/components/seo/json-ld';
import {
  PERSON_ID,
  breadcrumbSchema,
  jsonLdGraph,
  localizedUrl,
} from '@/lib/seo';
import { getPageSeo } from '@/lib/content';
import { pageMetadata } from '@/lib/page-metadata';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;

  return pageMetadata({
    locale,
    routeKey: '/contact',
    href: '/contact',
    fallbackImage: `/og/contact-${locale}.png`
  });
}

export default async function ContactoPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  // El mismo origen que `generateMetadata`: si el JSON-LD describiera algo
  // distinto de lo que dice el <head>, Google usa uno de los dos sin avisar.
  const seo = await getPageSeo('/contact', locale);
  const t = await getTranslations({ locale, namespace: 'Metadata' });
  const tHeader = await getTranslations({ locale, namespace: 'Header' });

  const schema = jsonLdGraph(
    {
      '@type': 'ContactPage',
      '@id': `${localizedUrl(locale, '/contact')}#contactpage`,
      url: localizedUrl(locale, '/contact'),
      name: seo?.title ?? t('defaultTitle'),
      description: seo?.description ?? t('defaultDescription'),
      inLanguage: locale,
      mainEntity: { '@id': PERSON_ID },
    },
    breadcrumbSchema([
      { name: tHeader('home'), url: localizedUrl(locale, '/') },
      { name: tHeader('contact'), url: localizedUrl(locale, '/contact') },
    ])
  );

  return (
    <>
      <Contact />
      <JsonLd data={schema} />
    </>
  );
}
