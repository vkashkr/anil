import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://ahmedabad.aliyaescort.com';

  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/ahmedabad-escort/', '/stories/'],
      disallow: ['/admin/', '/api/', '/login/', '/upload/', '/view/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}