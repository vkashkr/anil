import { MetadataRoute } from 'next';
import { getAllProfilesFromDynamoDB } from '@/app/lib/dynamodb';
import { ALLOWED_CITY_SLUGS, getProfileCitySlug, getProfileSlug } from '@/app/lib/city-slugs';

// Keep the sitemap stable for crawlers while allowing profile changes to appear quickly.
export const revalidate = 300;

const BASE_URL = 'https://www.aliyaescort.com';

type SitemapProfileRoute = { city: string; slug: string; updatedAt?: string };

async function fetchAllProfileSlugs(): Promise<SitemapProfileRoute[]> {
  try {
    const profiles = await getAllProfilesFromDynamoDB();
    const seenId = new Set<string>();
    const seenCitySlug = new Set<string>();
    const results: SitemapProfileRoute[] = [];
    for (const p of profiles) {
      if (!p.id || seenId.has(p.id)) continue;
      seenId.add(p.id);
      if (p.isVisible === false) continue;

      const city = getProfileCitySlug(p);
      if (!city) continue;

      // Match canonical profile route slug strategy.
      const slug = getProfileSlug(p);
      if (!slug) continue;

      // Each profile belongs to exactly one city — cross-posting to other
      // cities creates duplicate/doorway content and hurts rankings.
      const citySlugKey = `${city}:${slug}`;
      if (seenCitySlug.has(citySlugKey)) continue;
      seenCitySlug.add(citySlugKey);
      results.push({ city, slug, updatedAt: p.updatedAt });
    }
    return results;
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const rootRoute: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
  ];

  // Always include core city listing routes even if profile fetch is empty/timed out.
  const defaultCitySlugs = [...ALLOWED_CITY_SLUGS];
  const defaultCityRoutes: MetadataRoute.Sitemap = defaultCitySlugs.map((city) => ({
    url: `${BASE_URL}/${city}/escorts`,
    lastModified: now,
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }));

  let cityRoutes: MetadataRoute.Sitemap = [];
  let profileRoutes: MetadataRoute.Sitemap = [];
  try {
    const profiles = await fetchAllProfileSlugs();

    const uniqueCities = Array.from(new Set([...defaultCitySlugs])).sort();
    cityRoutes = uniqueCities.map((city) => ({
      url: `${BASE_URL}/${city}/escorts`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.9,
    }));

    profileRoutes = profiles.map(({ city, slug, updatedAt }) => ({
      url: `${BASE_URL}/${city}/escorts/${slug}`,
      lastModified: updatedAt ? new Date(updatedAt) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.error('Sitemap profile generation error:', error);
  }

  const finalCityRoutes = cityRoutes.length > 0 ? cityRoutes : defaultCityRoutes;
  return [...rootRoute, ...finalCityRoutes, ...profileRoutes];
}
