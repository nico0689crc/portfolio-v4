import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import About from '@/components/pages/about';
import { JsonLd } from '@/components/seo/json-ld';
import {
  PERSON_ID,
  breadcrumbSchema,
  buildPageMetadata,
  faqSchema,
  jsonLdGraph,
  localizedUrl,
} from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  return buildPageMetadata({
    locale,
    href: '/about',
    title: t('aboutTitle'),
    description: t('aboutDescription'),
    image: '/og/default.png',
    type: 'profile',
  });
}

export default async function SobreMiPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

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
      name: t('aboutTitle'),
      description: t('aboutDescription'),
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
