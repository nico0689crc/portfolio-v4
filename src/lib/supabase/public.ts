import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

/**
 * Cookieless Supabase client for every public read.
 *
 * Deliberately NOT the `@supabase/ssr` server client: that one calls
 * `cookies()`, which throws outside a request. `sitemap.ts`, `robots.ts`, the
 * `/resume.json` and `/llms.txt` route handlers and `generateStaticParams` all
 * run without a request context, so a cookie-bound client would break the
 * build. `unstable_cache` also refuses to wrap anything that reads cookies, so
 * this is additionally the only client whose reads can be cached.
 *
 * It authenticates with the anon key, which is public by design — it ships in
 * the browser bundle. What keeps that safe is RLS: with this key only content
 * whose policy admits the `anon` role is visible, so drafts stay invisible even
 * to a query that forgets to filter them.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. ' +
      'Copy .env.example to .env and fill them in.'
  );
}

export const supabasePublic = createClient<Database>(url, anonKey, {
  auth: {
    // No user session on this client: it must behave identically on every
    // request and during the build.
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  },
  global: {
    headers: { 'x-client-info': 'portafolio-v3/public' }
  }
});
