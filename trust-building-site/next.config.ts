import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Fully static: every page, including each immersion and convocation detail, is prerendered.
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
