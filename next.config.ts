import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';
import { legacyRedirects } from './src/data/legacyRoutes';

const withNextIntl = createNextIntlPlugin();

/**
 * Redirects the editor manages from the backoffice.
 *
 * Failure here is deliberately not fatal: a build that cannot reach Supabase
 * should still ship the site with its checked-in redirects rather than fail,
 * because the alternative is a deploy blocked by a transient network error.
 */
async function managedRedirects() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return [];

  try {
    const res = await fetch(`${url}/rest/v1/redirects?select=from_path,to_path,permanent`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` }
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const rows: { from_path: string; to_path: string; permanent: boolean }[] = await res.json();

    return rows.map((row) => ({
      source: row.from_path,
      destination: row.to_path,
      permanent: row.permanent
    }));
  } catch (error) {
    console.warn('[next.config] no se pudieron leer las redirecciones de Supabase:', error);

    return [];
  }
}

const supabaseHostname = new URL(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://localhost'
).hostname;

const nextConfig: NextConfig = {
  // Permite buildear sin pelearse con un `next dev` corriendo: los dos escriben
  // en `.next` y el que pierde la carrera muere con un ENOENT sobre un archivo
  // temporal que no dice nada. Con NEXT_DIST_DIR el build usa su propia carpeta.
  distDir: process.env.NEXT_DIST_DIR ?? '.next',

  experimental: {
    // Toda subida del panel viaja por un server action, y el default de Next
    // es 1 MB: una portada de 1,4 MB muere ahí, antes de llegar a la
    // validación propia, con un error de framework que no menciona el archivo.
    // 2 MB deja pasar cualquier JPEG razonable de 1200×630 sin convertir esto
    // en un canal para subir cosas grandes.
    serverActions: { bodySizeLimit: '2mb' }
  },

  images: {
    // Project screenshots live in Supabase Storage now, and `next/image`
    // refuses any remote host it was not told about. Derived from the env var
    // rather than hardcoded so a different Supabase project — a staging branch,
    // a restored backup — does not silently serve unoptimized images.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: supabaseHostname,
        pathname: '/storage/v1/object/public/**'
      }
    ]
  },

  // Runs ahead of the next-intl middleware, so a renamed slug keeps its
  // ranking instead of 404-ing.
  //
  // Two sources on purpose. `legacyRedirects` is checked into the repo because
  // it is what keeps already-indexed URLs alive and must survive a database
  // that is empty or unreachable. The `redirects` table is what the backoffice
  // writes, and it is read here rather than in middleware so a rule costs
  // nothing per request.
  //
  // The trade-off is that a redirect added from the panel only takes effect on
  // the next build. That is stated in the panel itself; moving this to
  // middleware would make it immediate at the cost of a database read on every
  // request that misses.
  async redirects() {
    const stat = legacyRedirects.map((r) => ({ ...r, permanent: true }));

    return [...stat, ...(await managedRedirects())];
  },
};

export default withNextIntl(nextConfig);
