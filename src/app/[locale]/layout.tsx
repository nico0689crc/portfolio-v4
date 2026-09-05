import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { GoogleAnalytics } from '@next/third-parties/google';
import { JsonLd } from '@/components/seo/json-ld';
import { ConsentInit } from '@/components/analytics/consent-init';
import { CookieConsent } from '@/components/analytics/cookie-consent';
import { PageViewTracker } from '@/components/analytics/page-view-tracker';
import { GA_ID } from '@/lib/analytics';
import {
  SITE_NAME,
  SITE_URL,
  buildAlternates,
  jsonLdGraph,
  localizedUrl,
  ogAlternateLocales,
  ogLocale,
  personSchema,
  webSiteSchema
} from '@/lib/seo';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  return {
    // Resolves every relative URL in metadata (OG images, canonicals) against
    // the production origin instead of localhost.
    metadataBase: new URL(SITE_URL),
    title: {
      template: t('titleTemplate'),
      default: t('defaultTitle'),
    },
    description: t('defaultDescription'),
    applicationName: SITE_NAME,
    authors: [{ name: SITE_NAME, url: SITE_URL }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    // Pages override this with their own route; this is the fallback for any
    // segment that doesn't set one.
    alternates: buildAlternates(locale, '/'),
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
    openGraph: {
      type: 'website',
      locale: ogLocale(locale),
      alternateLocale: ogAlternateLocales(locale),
      url: localizedUrl(locale, '/'),
      title: t('defaultTitle'),
      description: t('defaultDescription'),
      siteName: SITE_NAME,
      images: [
        {
          url: '/og/default.png',
          width: 1200,
          height: 630,
          alt: t('defaultTitle'),
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('defaultTitle'),
      description: t('defaultDescription'),
      images: ['/og/default.png'],
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const dynamic = 'force-static';

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Set the locale for the current request
  setRequestLocale(locale);

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  // Site-wide entities. Page-level schemas reference these by @id instead of
  // repeating them.
  const siteSchema = jsonLdGraph(
    personSchema(locale, t('jobTitle'), t('defaultDescription')),
    webSiteSchema(locale, t('defaultDescription'))
  );

  return (
    <html lang={locale}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background flex flex-col font-sans`}
      >
        <ConsentInit />
        <NextIntlClientProvider messages={messages}>
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
          <CookieConsent />
        </NextIntlClientProvider>
        <JsonLd data={siteSchema} />
        {GA_ID ? (
          <>
            <GoogleAnalytics gaId={GA_ID} />
            <PageViewTracker locale={locale} />
          </>
        ) : null}
      </body>
    </html>
  );
}
