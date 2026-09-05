import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';
import { legacyRedirects } from './src/data/legacyRoutes';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  // Runs ahead of the next-intl middleware, so a renamed slug keeps its
  // ranking instead of 404-ing.
  async redirects() {
    return legacyRedirects.map((r) => ({ ...r, permanent: true }));
  },
};

export default withNextIntl(nextConfig);
