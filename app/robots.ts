import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://ahmedabad.aliyaescort.com';

  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/stories'],
      disallow: ['/admin/', '/api/admin/', '/login', '/upload'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}