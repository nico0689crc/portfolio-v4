import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import Resume from '@/components/pages/resume';
import { JsonLd } from '@/components/seo/json-ld';
import {
  SITE_URL,
  breadcrumbSchema,
  buildPageMetadata,
  jsonLdGraph,
  localizedUrl,
} from '@/lib/seo';
import { pageMetadata } from '@/lib/page-metadata';
import { cvPersonNode } from '@/lib/cv-schema';
import { loadCvData } from '@/lib/cv-data';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const metadata = await pageMetadata({
    locale,
    routeKey: '/resume',
    href: '/resume',
    type: 'profile',
  });

  return {
    ...metadata,
    alternates: {
      ...metadata.alternates,
      types: {
        'application/json': [
          {
            url: locale === 'es' ? `${SITE_URL}/resume.es.json` : `${SITE_URL}/resume.json`,
            title: 'JSON Resume',
          },
        ],
      },
    },
  };
}

export default async function CurriculumPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'Metadata' });
  const tHeader = await getTranslations({ locale, namespace: 'Header' });
  const cv = await loadCvData(locale);

  const url = localizedUrl(locale, '/resume');
  const cvUrl = `${SITE_URL}${cv.cvFiles[locale] ?? cv.cvFiles.en}`;

  const schema = jsonLdGraph(
    {
      '@type': 'ProfilePage',
      '@id': `${url}#resume`,
      url,
      name: t('resumeTitle'),
      description: t('resumeDescription'),
      inLanguage: locale,
      mainEntity: cvPersonNode(cv),
      significantLink: cvUrl,
    },
    breadcrumbSchema([
      { name: tHeader('home'), url: localizedUrl(locale, '/') },
      { name: tHeader('resume'), url },
    ])
  );

  return (
    <>
      <Resume cv={cv} />
      <JsonLd data={schema} />
    </>
  );
}
