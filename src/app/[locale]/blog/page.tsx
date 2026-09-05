import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import BlogList from '@/components/pages/blog';
import { JsonLd } from '@/components/seo/json-ld';
import { getPosts } from '@/lib/content';
import {
  PERSON_ID,
  breadcrumbSchema,
  buildPageMetadata,
  jsonLdGraph,
  localizedUrl,
} from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Blog' });

  // El blog no está en `page_seo`: esa tabla cubre las rutas que ya existían
  // cuando se sembró. Cuando haya una fila, esto pasa a `pageMetadata` como el
  // resto.
  return buildPageMetadata({
    locale,
    href: '/blog',
    title: t('title'),
    description: t('subtitle'),
    image: '/og/default.png',
  });
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
