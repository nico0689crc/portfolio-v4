import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import BlogList from '@/components/pages/blog';
import { POSTS_PER_PAGE, getBlogListing, blogListingUrl } from '@/components/pages/blog/listing';
import { JsonLd } from '@/components/seo/json-ld';
import { getPosts } from '@/lib/content';
import { permanentRedirect, routing } from '@/i18n/routing';
import { pageMetadata } from '@/lib/page-metadata';
import { PERSON_ID, breadcrumbSchema, jsonLdGraph, localizedUrl } from '@/lib/seo';

type RouteParams = { locale: string; page: string };

export async function generateStaticParams() {
  const params: RouteParams[] = [];

  for (const locale of routing.locales) {
    const posts = await getPosts(locale);
    const totalPages = Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE));

    // La página 1 vive en `/blog`, no acá: generarla también duplicaría la ruta.
    for (let page = 2; page <= totalPages; page++) {
      params.push({ locale, page: String(page) });
    }
  }

  return params;
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<RouteParams>;
  searchParams: Promise<{ tag?: string }>;
}): Promise<Metadata> {
  const { locale, page: pageParam } = await params;
  const { tag } = await searchParams;
  const page = Number(pageParam);

  const [metadata, t] = await Promise.all([
    // Mismo título/descripción editables desde el panel que `/blog`: es el
    // mismo contenido, sólo otra tanda.
    pageMetadata({ locale, routeKey: '/blog', href: '/blog' }),
    getTranslations({ locale, namespace: 'Blog' }),
  ]);

  const baseTitle = typeof metadata.title === 'string' ? metadata.title : t('title');

  return {
    ...metadata,
    title: `${baseTitle} — ${t('pagination.titleSuffix', { page })}`,
    // Sin hreflang acá por la misma razón que en `/blog`: el conteo de notas
    // (y el slug del tag, si hay uno) puede no coincidir entre idiomas.
    alternates: { canonical: blogListingUrl(locale, page, tag) },
  };
}

export default async function BlogPaginatedPage({
  params,
  searchParams,
}: {
  params: Promise<RouteParams>;
  searchParams: Promise<{ tag?: string }>;
}) {
  const { locale, page: pageParam } = await params;
  const { tag } = await searchParams;
  setRequestLocale(locale);

  const page = Number(pageParam);
  if (!Number.isInteger(page) || page < 1) notFound();

  // La página 1 es contenido duplicado de `/blog`; un 308 conserva el ranking
  // en vez de dejar dos URLs indexables con lo mismo.
  if (page === 1) {
    permanentRedirect({ href: { pathname: '/blog', query: tag ? { tag } : undefined }, locale });
  }

  const listing = await getBlogListing(locale, page, tag);
  if (!listing) notFound();

  const [t, tHeader] = await Promise.all([
    getTranslations({ locale, namespace: 'Blog' }),
    getTranslations({ locale, namespace: 'Header' }),
  ]);

  const blogUrl = localizedUrl(locale, '/blog');
  const url = blogListingUrl(locale, page, listing.activeTag?.slug ?? null);

  const schema = jsonLdGraph(
    {
      '@type': 'Blog',
      '@id': `${blogUrl}#blog`,
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
      { name: t('title'), url: blogUrl },
      { name: t('pagination.titleSuffix', { page }), url },
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
