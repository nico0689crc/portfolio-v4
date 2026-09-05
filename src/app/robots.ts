import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

/**
 * AI crawlers are allowed on purpose: the CV is published so that assistants
 * can answer questions about this profile. They are named explicitly rather
 * than left to the wildcard so the intent is unambiguous — several of these
 * agents treat an absent directive differently from an explicit allow.
 */
const AI_CRAWLERS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-User',
  'Claude-SearchBot',
  'anthropic-ai',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot-Extended',
  'CCBot',
  'meta-externalagent',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/_next/'],
      },
      {
        userAgent: AI_CRAWLERS,
        allow: '/',
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
