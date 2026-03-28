import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://ahmedabad.aliyaescort.com';

  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/api/profile'],
      disallow: ['/admin/', '/api/admin/', '/bff/', '/login', '/upload'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}