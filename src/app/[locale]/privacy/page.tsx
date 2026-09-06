import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import Privacy from '@/components/pages/privacy';
import { JsonLd } from '@/components/seo/json-ld';
import { PERSON_ID, breadcrumbSchema, jsonLdGraph, localizedUrl } from '@/lib/seo';
import { getPageSeo } from '@/lib/content';
import { pageMetadata } from '@/lib/page-metadata';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;

  return pageMetadata({ locale, routeKey: '/privacy', href: '/privacy' });
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  // El mismo origen que `generateMetadata`: si el JSON-LD describiera algo
  // distinto de lo que dice el <head>, Google usa uno de los dos sin avisar.
  const seo = await getPageSeo('/privacy', locale);
  const t = await getTranslations({ locale, namespace: 'Metadata' });
  const tPrivacy = await getTranslations({ locale, namespace: 'Privacy' });
  const tHeader = await getTranslations({ locale, namespace: 'Header' });

  const schema = jsonLdGraph(
    {
      '@type': 'WebPage',
      '@id': `${localizedUrl(locale, '/privacy')}#webpage`,
      url: localizedUrl(locale, '/privacy'),
      name: seo?.title ?? t('defaultTitle'),
      description: seo?.description ?? t('defaultDescription'),
      inLanguage: locale,
      about: { '@id': PERSON_ID },
    },
    breadcrumbSchema([
      { name: tHeader('home'), url: localizedUrl(locale, '/') },
      { name: tPrivacy('title'), url: localizedUrl(locale, '/privacy') },
    ])
  );

  return (
    <>
      <Privacy locale={locale} />
      <JsonLd data={schema} />
    </>
  );
}
