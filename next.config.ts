import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
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
