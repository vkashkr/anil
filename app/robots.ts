import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://ahmedabad.aliyaescort.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/ahmedabad-escort',
          '/ahmedabad-escort/',
          '/ahmedabad-escort/*',
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
        allow: ['/ahmedabad-escort/', '/ahmedabad-escort/*', '/'],
        disallow: ['/admin/', '/api/', '/login/', '/upload/', '/view/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}