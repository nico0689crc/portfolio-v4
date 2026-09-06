import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import Hero from "@/components/pages/home/hero";
import ShortAbout from "@/components/pages/home/short-about";
import Skills from "@/components/pages/home/skills";
import WhyMe from '@/components/pages/home/why-me';
import HowWeWork from '@/components/pages/home/how-we-work';
import { pageMetadata } from '@/lib/page-metadata';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;

  return pageMetadata({
    locale,
    routeKey: '/',
    href: '/',
    type: 'profile',
    absoluteTitle: true
  });
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
      <HowWeWork />
    </>
  );
}
