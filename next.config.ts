import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    // useCache: true, // Not needed in v16 if cacheComponents is standard, but checking docs it might be 'dynamicIO' or just enabled.
    // The prompt docs say "use cache is enabled with Cache Components feature... To enable it, add cacheComponents".
    // However, types might complain if property doesn't exist on NextConfig yet.
    // Let's try adding it at top level as per docs.
  },
  cacheComponents: true,
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.asariweb.pl',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
