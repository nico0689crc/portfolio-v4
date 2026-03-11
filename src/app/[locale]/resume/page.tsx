import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });
  return {
    title: t('resumeTitle'),
    description: t('resumeDescription'),
    alternates: {
      canonical: 'https://nicolasarielfernandez.com/en/resume',
    },
  };
}

export default async function CurriculumPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Header');
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold mb-6">{t('resume')}</h1>
      <p>Contenido de la página del curriculum.</p>
    </div>
  );
}
