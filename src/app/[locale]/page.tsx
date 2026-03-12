import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import Hero from "@/components/pages/home/hero";
import ShortAbout from "@/components/pages/home/short-about";
import Skills from "@/components/pages/home/skills";
import WhyMe from '@/components/pages/home/why-me';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });
  return {
    title: t('homeTitle'),
    description: t('homeDescription'),
    alternates: {
      canonical: 'https://nicolasarielfernandez.com',
      languages: {
        'en': 'https://nicolasarielfernandez.com/en',
        'es': 'https://nicolasarielfernandez.com/es',
      },
    },
  };
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Hero />
      <ShortAbout />
      <Skills />
      <WhyMe />
    </>
  );
}
