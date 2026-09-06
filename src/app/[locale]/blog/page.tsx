import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import BlogList from '@/components/pages/blog';
import { JsonLd } from '@/components/seo/json-ld';
import { getPosts } from '@/lib/content';
import { pageMetadata } from '@/lib/page-metadata';
import { PERSON_ID, SITE_URL, breadcrumbSchema, jsonLdGraph, localizedUrl } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Blog' });

  // Igual que el resto de las rutas fijas: el título y la descripción salen de
  // `page_seo`, así que se editan desde el panel en vez de vivir en una clave
  // de mensajes que nadie asocia con SEO.
  const metadata = await pageMetadata({ locale, routeKey: '/blog', href: '/blog' });

  return {
    ...metadata,
    alternates: {
      ...metadata.alternates,
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

export default async function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [posts, t, tHeader] = await Promise.all([
    getPosts(locale),
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
      blogPost: posts.map((post) => ({
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
      <BlogList posts={posts} locale={locale} />
      <JsonLd data={schema} />
    </>
  );
}
