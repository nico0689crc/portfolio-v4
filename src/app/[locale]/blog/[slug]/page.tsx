import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { permanentRedirect, routing } from '@/i18n/routing';
import PostArticle from '@/components/pages/blog/PostArticle';
import { JsonLd } from '@/components/seo/json-ld';
import { BUCKETS, getPost, getPostSlugMap, getPosts, getRedirectedSlug, storageUrl } from '@/lib/content';
import {
  PERSON_ID,
  SITE_URL,
  breadcrumbSchema,
  buildPageMetadata,
  jsonLdGraph,
  localizedUrl,
} from '@/lib/seo';

/** Cada idioma tiene su slug, así que la URL del otro hay que buscarla. */
async function hrefResolver(key: string, fallbackSlug: string) {
  const map = await getPostSlugMap();
  const slugs = map.find((entry) => entry.key === key)?.slugs ?? {};

  return (locale: string) => ({
    pathname: '/blog/[slug]' as const,
    params: { slug: slugs[locale] ?? fallbackSlug },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getPost(slug, locale);

  if (!post) {
    const t = await getTranslations({ locale, namespace: 'Blog' });

    return buildPageMetadata({
      locale,
      href: { pathname: '/blog/[slug]', params: { slug } },
      title: t('title'),
      description: t('subtitle'),
      type: 'article',
    });
  }

  // Cada campo cae al visible cuando no hay override, así que una nota se
  // publica sin tocar ninguno y sigue teniendo metadata correcta.
  const social = post.ogImage ?? post.coverPath;

  return buildPageMetadata({
    locale,
    href: await hrefResolver(post.key, slug),
    title: post.seoTitle ?? post.title,
    description: post.seoDescription ?? post.excerpt,
    image: social ? storageUrl(social, BUCKETS.postMedia) : '/og/default.png',
    type: 'article',
    noindex: post.noindex,
    article: {
      publishedTime: post.publishedAt,
      modifiedTime: post.contentUpdatedAt ?? post.publishedAt,
      tags: post.tags.map((tag) => tag.name),
    },
  });
}

export async function generateStaticParams() {
  const map = await getPostSlugMap();

  return map.flatMap((entry) =>
    routing.locales.flatMap((locale) => (entry.slugs[locale] ? [{ locale, slug: entry.slugs[locale] }] : []))
  );
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const post = await getPost(slug, locale);

  if (!post) {
    // Igual que en proyectos: un slug que ya no resuelve puede ser uno que el
    // editor renombró, y la tabla de redirecciones es lo que conserva su
    // ranking. Sólo se consulta en el miss.
    const current = await getRedirectedSlug('post', locale, slug);

    if (current) {
      permanentRedirect({ href: { pathname: '/blog/[slug]', params: { slug: current } }, locale });
    }

    notFound();
  }

  const [t, tHeader, allPosts] = await Promise.all([
    getTranslations({ locale, namespace: 'Blog' }),
    getTranslations({ locale, namespace: 'Header' }),
    getPosts(locale),
  ]);


  // Las más recientes que no sean esta. Relacionar por tags compartidos sería
  // mejor, pero con pocos artículos deja el bloque vacío la mitad de las veces
  // y un enlace interno que no existe no ayuda a nadie.
  const related = allPosts.filter((other) => other.key !== post.key).slice(0, 2);

  const url = localizedUrl(locale, { pathname: '/blog/[slug]', params: { slug: post.slug } });


  const schema = jsonLdGraph(
    {
      '@type': 'BlogPosting',
      '@id': `${url}#post`,
      url,
      // `headline` es el titular del artículo, no el title tag: Google lo usa
      // para el contenido, no para la SERP, así que va el visible aunque haya
      // override de SEO.
      headline: post.title,
      description: post.seoDescription ?? post.excerpt,
      inLanguage: locale,
      datePublished: post.publishedAt,
      dateModified: post.contentUpdatedAt ?? post.publishedAt,
      wordCount: post.wordCount,
      // Duración ISO 8601: lo que espera schema.org, no "5 min".
      ...(post.readingMinutes ? { timeRequired: `PT${post.readingMinutes}M` } : {}),
      keywords: post.tags.map((tag) => tag.name).join(', '),
      ...(post.tags.length > 0 ? { articleSection: post.tags[0].name } : {}),
      author: { '@id': PERSON_ID },
      // En un blog personal el autor es también el editor; declararlo evita
      // que Search Console lo marque como campo recomendado ausente.
      publisher: { '@id': PERSON_ID },
      // Ancla el artículo a la página que lo contiene, que es lo que distingue
      // "este contenido" de "esta URL".
      mainEntityOfPage: { '@type': 'WebPage', '@id': url },
      image: post.coverPath
        ? storageUrl(post.coverPath, BUCKETS.postMedia)
        : `${SITE_URL}/og/default.png`,
      isPartOf: { '@id': `${localizedUrl(locale, '/blog')}#blog` },
    },
    breadcrumbSchema([
      { name: tHeader('home'), url: localizedUrl(locale, '/') },
      { name: t('title'), url: localizedUrl(locale, '/blog') },
      { name: post.title, url },
    ])
  );

  return (
    <>
      <PostArticle post={post} locale={locale} related={related} />
      <JsonLd data={schema} />
    </>
  );
}
