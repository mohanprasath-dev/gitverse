/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@gitverse/ui', '@gitverse/types', '@gitverse/database'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
    ],
  },
  experimental: {
    optimizePackageImports: ['framer-motion', 'three'],
  },
};

module.exports = nextConfig;
