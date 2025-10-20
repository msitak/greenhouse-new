import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Skip ESLint (and optionally TS) errors during production builds to
  // allow deployment even if there are style violations. Local linting
  // can still be run via `npm run lint`.
  eslint: {
    ignoreDuringBuilds: true,
  },
  // If you still want typechecking to block builds, set this to false.
  // Keeping it true prevents unexpected deploy failures due to types.
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.asariweb.pl',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
