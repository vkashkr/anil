import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://www.aliyaescort.com'; // Adjust domain as needed

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/bff/', '/login', '/upload'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}