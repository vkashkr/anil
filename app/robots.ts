import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://ahmedabad.aliyaescort.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/escorts',
          '/escorts/',
          '/escorts/*',
        ],
        disallow: ['/admin/', '/api/', '/login/', '/upload/', '/view/'],
      },
      // Allow image crawlers to index all public images
      {
        userAgent: 'Googlebot-Image',
        allow: '/',
      },
      {
        userAgent: 'Bingbot',
        allow: ['/escorts/', '/escorts/*', '/'],
        disallow: ['/admin/', '/api/', '/login/', '/upload/', '/view/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}