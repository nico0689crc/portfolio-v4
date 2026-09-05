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
import { cvPersonNode, type CvProse } from '@/lib/cv-schema';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  const metadata = buildPageMetadata({
    locale,
    href: '/resume',
    title: t('resumeTitle'),
    description: t('resumeDescription'),
    image: '/og/default.png',
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
  const tAbout = await getTranslations({ locale, namespace: 'About' });

  const tResume = await getTranslations({ locale, namespace: 'Resume' });

  const prose: CvProse = {
    jobs: tAbout.raw('experience.jobs'),
    degrees: tResume.raw('education'),
    certNames: tResume.raw('certifications'),
    jobTitle: t('jobTitle'),
    summary: tResume('intro'),
  };

  const url = localizedUrl(locale, '/resume');
  const cvUrl =
    locale === 'es'
      ? `${SITE_URL}/CV_Nicolas_Fernandez_FullStack_UXUI_ES.pdf`
      : `${SITE_URL}/CV_Nicolas_Fernandez_FullStack_UXUI_EN.pdf`;

  const schema = jsonLdGraph(
    {
      '@type': 'ProfilePage',
      '@id': `${url}#resume`,
      url,
      name: t('resumeTitle'),
      description: t('resumeDescription'),
      inLanguage: locale,
      mainEntity: cvPersonNode(locale, prose),
      significantLink: cvUrl,
    },
    breadcrumbSchema([
      { name: tHeader('home'), url: localizedUrl(locale, '/') },
      { name: tHeader('resume'), url },
    ])
  );

  return (
    <>
      <Resume />
      <JsonLd data={schema} />
    </>
  );
}
