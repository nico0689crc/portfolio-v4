import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import Projects from '@/components/pages/portfolio';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });
  return {
    title: t('portfolioTitle'),
    description: t('portfolioDescription'),
    alternates: {
      canonical: 'https://nicolasarielfernandez.com/en/portfolio',
    },
  };
}

export default async function PortafolioPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <Projects />
  );
}
