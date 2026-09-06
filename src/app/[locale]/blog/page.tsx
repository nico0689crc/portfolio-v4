import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import BlogList from '@/components/pages/blog';
import { getBlogListing } from '@/components/pages/blog/listing';
import { JsonLd } from '@/components/seo/json-ld';
import { pageMetadata } from '@/lib/page-metadata';
import { PERSON_ID, SITE_URL, breadcrumbSchema, jsonLdGraph, localizedUrl } from '@/lib/seo';

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ tag?: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const { tag } = await searchParams;
  const t = await getTranslations({ locale, namespace: 'Blog' });

  // Igual que el resto de las rutas fijas: el título y la descripción salen de
  // `page_seo`, así que se editan desde el panel en vez de vivir en una clave
  // de mensajes que nadie asocia con SEO.
  const metadata = await pageMetadata({ locale, routeKey: '/blog', href: '/blog', fallbackImage: `/og/blog-${locale}.png` });

  // Un tag filtrado no tiene hreflang propio (el slug del tag difiere por
  // idioma), así que sólo se ajusta el canonical y se descarta el resto.
  const alternates: Metadata['alternates'] = tag
    ? { canonical: `${metadata.alternates?.canonical}?tag=${encodeURIComponent(tag)}` }
    : { ...metadata.alternates };

  return {
    ...metadata,
    alternates: {
      ...alternates,
      // Declarar el feed acá es lo que hace que un lector lo descubra solo al
      // pegar la URL del blog, sin tener que adivinar la ruta.
      types: {
        'application/rss+xml': [
          {
            url: locale === 'en' ? `${SITE_URL}/rss.xml` : `${SITE_URL}/rss.${locale}.xml`,
            title: `${t('title')} — RSS`,
          },
        ],
      },
    },
  };
}

export default async function BlogPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ tag?: string }>;
}) {
  const { locale } = await params;
  const { tag } = await searchParams;
  setRequestLocale(locale);

  const listing = await getBlogListing(locale, 1, tag);
  if (!listing) notFound();

  const [t, tHeader] = await Promise.all([
    getTranslations({ locale, namespace: 'Blog' }),
    getTranslations({ locale, namespace: 'Header' }),
  ]);

  const url = localizedUrl(locale, '/blog');

  const schema = jsonLdGraph(
    {
      '@type': 'Blog',
      '@id': `${url}#blog`,
      url,
      name: t('title'),
      description: t('subtitle'),
      inLanguage: locale,
      author: { '@id': PERSON_ID },
      blogPost: listing.posts.map((post) => ({
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.excerpt,
        datePublished: post.publishedAt,
        url: localizedUrl(locale, { pathname: '/blog/[slug]', params: { slug: post.slug } }),
      })),
    },
    breadcrumbSchema([
      { name: tHeader('home'), url: localizedUrl(locale, '/') },
      { name: t('title'), url },
    ])
  );

  return (
    <>
      <BlogList
        posts={listing.posts}
        locale={locale}
        tags={listing.tags}
        activeTag={listing.activeTag}
        totalPosts={listing.totalPosts}
        currentPage={listing.currentPage}
        totalPages={listing.totalPages}
      />
      <JsonLd data={schema} />
    </>
  );
}
