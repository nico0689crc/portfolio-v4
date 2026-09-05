import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link, permanentRedirect, routing } from '@/i18n/routing';
import PostBody from '@/components/pages/blog/PostBody';
import { JsonLd } from '@/components/seo/json-ld';
import { BUCKETS, getPost, getPostSlugMap, getRedirectedSlug, storageUrl } from '@/lib/content';
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

  return buildPageMetadata({
    locale,
    href: await hrefResolver(post.key, slug),
    title: post.title,
    description: post.excerpt,
    image: post.coverPath ? storageUrl(post.coverPath, BUCKETS.postCovers) : '/og/default.png',
    type: 'article',
    noindex: post.noindex,
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

  const [t, tHeader] = await Promise.all([
    getTranslations({ locale, namespace: 'Blog' }),
    getTranslations({ locale, namespace: 'Header' }),
  ]);

  const url = localizedUrl(locale, { pathname: '/blog/[slug]', params: { slug: post.slug } });

  const formatDate = (value: string) =>
    new Date(value).toLocaleDateString(locale === 'es' ? 'es-AR' : 'en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

  const schema = jsonLdGraph(
    {
      '@type': 'BlogPosting',
      '@id': `${url}#post`,
      url,
      headline: post.title,
      description: post.excerpt,
      inLanguage: locale,
      datePublished: post.publishedAt,
      dateModified: post.contentUpdatedAt ?? post.publishedAt,
      wordCount: post.wordCount,
      keywords: post.tags.map((tag) => tag.name).join(', '),
      author: { '@id': PERSON_ID },
      image: post.coverPath
        ? storageUrl(post.coverPath, BUCKETS.postCovers)
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
      <article className="pt-24">
        <div className="section-padding pb-8">
          <div className="container mx-auto max-w-3xl">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors mb-8"
            >
              ← {t('backToBlog')}
            </Link>

            <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">{post.title}</h1>

            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-6">
              {post.publishedAt && (
                <time dateTime={post.publishedAt}>
                  {t('published')} {formatDate(post.publishedAt)}
                </time>
              )}
              {post.readingMinutes && (
                <>
                  <span aria-hidden>·</span>
                  <span>
                    {post.readingMinutes} {t('readingTime')}
                  </span>
                </>
              )}
            </div>

            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {post.tags.map((tag) => (
                  <span key={tag.key} className="tech-tag">
                    {tag.name}
                  </span>
                ))}
              </div>
            )}

            {post.coverPath && post.coverWidth && post.coverHeight && (
              <div className="relative aspect-video rounded-xl overflow-hidden bg-muted mb-10">
                <Image
                  src={storageUrl(post.coverPath, BUCKETS.postCovers)}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, 768px"
                  {...(post.coverBlurDataUrl
                    ? { placeholder: 'blur' as const, blurDataURL: post.coverBlurDataUrl }
                    : {})}
                  className="object-cover"
                  priority
                />
              </div>
            )}

            <PostBody body={post.body} />
          </div>
        </div>
      </article>
      <JsonLd data={schema} />
    </>
  );
}
