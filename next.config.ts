import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  //output: 'export',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'gif-gif.s3.amazonaws.com',
      },
    ],
  },
  // Note: add remotePatterns here when removing per-component `unoptimized` props
  async headers() {
    return [
      // Security + crawl-hint headers on every response
      {
        source: '/(.*)',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      // Long-cache immutable assets (hashed filenames by Next.js)
      {
        source: '/_next/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // Public images / fonts
      {
        source: '/(.*)\\.(ico|png|jpg|jpeg|gif|webp|svg|woff|woff2|ttf|otf)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' },
        ],
      },
    ];
  },
  async redirects() {
    return [
      // Permanent redirect: /escorts?name=priya → /escorts/priya
      // Passes link equity and prevents duplicate content indexing
      {
        source: '/escorts',
        has: [{ type: 'query', key: 'name', value: '(?<name>.+)' }],
        destination: '/escorts/:name',
        permanent: true,
      },
      // Legacy /profile?name= redirect (old URLs before directory rename)
      {
        source: '/profile',
        has: [{ type: 'query', key: 'name', value: '(?<name>.+)' }],
        destination: '/escorts/:name',
        permanent: true,
      },
      // Legacy /profile/[slug] redirect
      {
        source: '/profile/:slug',
        destination: '/escorts/:slug',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
