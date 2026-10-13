import type { NextConfig } from 'next';

// GitHub Pages serves the site from /<repo-name>/. Override with PAGES_BASE_PATH
// (e.g. "" for a custom domain).
const basePath = process.env.NODE_ENV === 'production' ? (process.env.PAGES_BASE_PATH ?? '/Mistria-Almanac') : '';

const nextConfig: NextConfig = {
  output: 'export',
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  poweredByHeader: false,
};

export default nextConfig;
