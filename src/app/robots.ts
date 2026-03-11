import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const host = 'https://nicolasarielfernandez.com';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/_next/'],
    },
    sitemap: `${host}/sitemap.xml`,
  };
}
