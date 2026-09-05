import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link, permanentRedirect, routing } from '@/i18n/routing';
import PostBody from '@/components/pages/blog/PostBody';
import TableOfContents from '@/components/pages/blog/TableOfContents';
import { extractHeadings } from '@/components/pages/blog/headings';
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
    image: social ? storageUrl(social, BUCKETS.postCovers) : '/og/default.png',
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

  const headings = extractHeadings(post.body);

  // Las más recientes que no sean esta. Relacionar por tags compartidos sería
  // mejor, pero con pocos artículos deja el bloque vacío la mitad de las veces
  // y un enlace interno que no existe no ayuda a nadie.
  const related = allPosts.filter((other) => other.key !== post.key).slice(0, 2);

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
                  alt={post.coverAlt ?? ''}
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

            <TableOfContents headings={headings} label={t('toc')} />

            <PostBody body={post.body} />
          </div>
        </div>

        {related.length > 0 && (
          // Enlaces internos reales al final del artículo: es lo que reparte
          // autoridad entre notas y lo que evita que cada una sea un callejón.
          <div className="section-padding pt-0">
            <div className="container mx-auto max-w-3xl">
              <h2 className="font-display text-xl font-bold text-foreground mb-4">{t('related')}</h2>
              <ul className="grid gap-4 sm:grid-cols-2">
                {related.map((other) => (
                  <li key={other.key}>
                    <Link
                      href={{ pathname: '/blog/[slug]', params: { slug: other.slug } }}
                      className="block rounded-xl border border-border p-5 hover:border-accent transition-colors"
                    >
                      <span className="font-display font-bold text-foreground block mb-1">
                        {other.title}
                      </span>
                      <span className="text-muted-foreground text-sm line-clamp-2">{other.excerpt}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </article>
      <JsonLd data={schema} />
    </>
  );
}
