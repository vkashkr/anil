import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://aliyaescort.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/Ahmedabad/*',
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
        allow: ['/Ahmedabad/*', '/ahmedabad/'],
        disallow: ['/admin/', '/api/', '/login/', '/upload/', '/view/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}