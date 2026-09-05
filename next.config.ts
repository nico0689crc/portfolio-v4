import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';
import { legacyRedirects } from './src/data/legacyRoutes';

const withNextIntl = createNextIntlPlugin();

const supabaseHostname = new URL(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://localhost'
).hostname;

const nextConfig: NextConfig = {
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
  async redirects() {
    return legacyRedirects.map((r) => ({ ...r, permanent: true }));
  },
};

export default withNextIntl(nextConfig);
