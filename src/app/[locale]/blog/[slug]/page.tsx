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
  WEBSITE_ID,
  breadcrumbSchema,
  buildPageMetadata,
  imageObject,
  jsonLdGraph,
  localizedUrl,
  webPageSchema,
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
    social: { title: post.ogTitle, description: post.ogDescription },
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


  const breadcrumbId = `${url}#breadcrumb`;

  // La portada como nodo con dimensiones cuando las hay; si no, la imagen por
  // defecto como URL suelta, que es todo lo que se sabe de ella.
  const primaryImage = post.coverPath
    ? imageObject(storageUrl(post.coverPath, BUCKETS.postMedia), {
        width: post.coverWidth,
        height: post.coverHeight,
        caption: post.coverAlt,
      })
    : `${SITE_URL}/og/default.png`;

  const schema = jsonLdGraph(
    webPageSchema({
      url,
      name: post.title,
      description: post.seoDescription ?? post.excerpt,
      locale,
      primaryImage,
      breadcrumbId,
      datePublished: post.publishedAt,
      dateModified: post.contentUpdatedAt ?? post.publishedAt,
    }),
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
      // Sin tags se omite: `keywords: ""` le dice a Google que el artículo no
      // trata de nada, que es peor que no decirle nada.
      ...(post.tags.length > 0
        ? {
            keywords: post.tags.map((tag) => tag.name).join(', '),
            articleSection: post.tags[0].name,
          }
        : {}),
      author: { '@id': PERSON_ID },
      // En un blog personal el autor es también el editor; declararlo evita
      // que Search Console lo marque como campo recomendado ausente.
      publisher: { '@id': PERSON_ID },
      // Referencia al nodo WebPage que se emite arriba, no una declaración
      // suelta: así el grafo queda cerrado y no apunta a algo inexistente.
      mainEntityOfPage: { '@id': url },
      image: primaryImage,
      // El nodo Blog sólo existe en el listado, así que desde acá el artículo
      // se ancla al sitio, que sí está declarado en todas las páginas.
      isPartOf: { '@id': WEBSITE_ID },
    },
    breadcrumbSchema(
      [
        { name: tHeader('home'), url: localizedUrl(locale, '/') },
        { name: t('title'), url: localizedUrl(locale, '/blog') },
        { name: post.title, url },
      ],
      breadcrumbId
    )
  );

  return (
    <>
      <PostArticle post={post} locale={locale} related={related} />
      <JsonLd data={schema} />
    </>
  );
}
