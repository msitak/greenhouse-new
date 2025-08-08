import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [new URL('https://img.asariweb.pl/normal/*')],
  },
};

export default nextConfig;
