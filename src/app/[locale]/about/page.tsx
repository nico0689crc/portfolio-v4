import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import About from '@/components/pages/about';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });
  return {
    title: t('aboutTitle'),
    description: t('aboutDescription'),
    alternates: {
      canonical: 'https://nicolasarielfernandez.com/about',
      languages: {
        'en': 'https://nicolasarielfernandez.com/en/about',
        'es': 'https://nicolasarielfernandez.com/es/sobre-mi',
      },
    },
  };
}

export default async function SobreMiPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <About />
  );
}
