import { getPosts, getSetting } from '@/lib/content';
import { SITE_NAME, SITE_URL } from '@/lib/seo';
import { getPathname } from '@/i18n/routing';

/** `]]>` es lo único que puede cerrar un CDATA antes de tiempo. */
const cdata = (value: string) => `<![CDATA[${value.replace(/]]>/g, ']]&gt;')}]]>`;

/**
 * Feed RSS del blog, uno por idioma.
 *
 * Se sirve como route handler y no como página porque no es HTML, y las URLs
 * se arman con `getPathname` de next-intl para que los segmentos traducidos y
 * el prefijo `as-needed` no se dupliquen a mano — un feed que apunta a URLs que
 * redirigen le cuesta un salto a cada lector.
 */
export async function buildRssFeed(locale: string): Promise<string> {
  const posts = await getPosts(locale);
  const home = locale === 'en' ? SITE_URL : `${SITE_URL}/${locale}`;
  const blogUrl = `${SITE_URL}${getPathname({ href: '/blog', locale })}`;
  const self = `${SITE_URL}${locale === 'en' ? '/rss.xml' : `/rss.${locale}.xml`}`;

  const items = posts
    .filter((post) => !post.noindex)
    .map((post) => {
      const url = `${SITE_URL}${getPathname({
        href: { pathname: '/blog/[slug]', params: { slug: post.slug } },
        locale
      })}`;

      return `    <item>
      <title>${cdata(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${cdata(post.seoDescription ?? post.excerpt)}</description>
      ${post.publishedAt ? `<pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>` : ''}
    </item>`;
    })
    .join('\n');

  const description = (await getSetting<string>('blog_rss_description')) ?? SITE_NAME;

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${cdata(SITE_NAME)}</title>
    <link>${blogUrl}</link>
    <description>${cdata(description)}</description>
    <language>${locale}</language>
    <atom:link href="${self}" rel="self" type="application/rss+xml" />
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <docs>${home}</docs>
${items}
  </channel>
</rss>
`;
}
