import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  //output: 'export',
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      // Permanent redirect: /ahmedabad-escort?name=priya → /ahmedabad-escort/priya
      // Passes link equity and prevents duplicate content indexing
      {
        source: '/ahmedabad-escort',
        has: [{ type: 'query', key: 'name', value: '(?<name>.+)' }],
        destination: '/ahmedabad-escort/:name',
        permanent: true,
      },
      // Legacy /profile?name= redirect (old URLs before directory rename)
      {
        source: '/profile',
        has: [{ type: 'query', key: 'name', value: '(?<name>.+)' }],
        destination: '/ahmedabad-escort/:name',
        permanent: true,
      },
      // Legacy /profile/[slug] redirect
      {
        source: '/profile/:slug',
        destination: '/ahmedabad-escort/:slug',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
