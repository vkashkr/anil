import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://ahmedabad.aliyaescort.com';

  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/api/profile', '/bff/api/get-profiles', '/stories'],
      disallow: ['/admin/', '/api/admin/', '/login', '/upload'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}