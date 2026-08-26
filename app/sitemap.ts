import { MetadataRoute } from 'next';
import { getAllProfilesFromDynamoDB } from '@/app/lib/dynamodb';
import { ALLOWED_CITY_SLUGS, getProfileCitySlug, makeSlug } from '@/app/lib/city-slugs';

// Re-fetch from DynamoDB on every request — no build-time baking
export const dynamic = 'force-dynamic';

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
      const raw = p.seoTitle || p.name;
      if (!raw || raw === '-') continue;
      const slug = makeSlug(raw);
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
    // Prevent long-running profile fetches from delaying sitemap generation.
    // If fetching profiles takes longer than `PROFILE_FETCH_TIMEOUT_MS`, fall
    // back to an empty list so the sitemap still returns quickly. This helps
    // avoid Google Search Console "Temporary processing error" when the
    // server is slow or the upstream API is unresponsive.
    const PROFILE_FETCH_TIMEOUT_MS = 15000;
    const profiles = process.env.NODE_ENV === 'development'
      ? await fetchAllProfileSlugs()
      : ((await Promise.race([
          fetchAllProfileSlugs(),
          new Promise<SitemapProfileRoute[]>((resolve) =>
            setTimeout(() => resolve([]), PROFILE_FETCH_TIMEOUT_MS),
          ),
        ])) as SitemapProfileRoute[]);

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
