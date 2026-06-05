import { MetadataRoute } from 'next';
import { getAllProfilesFromDynamoDB } from '@/app/lib/dynamodb';

// Re-fetch from DynamoDB on every request — no build-time baking
export const dynamic = 'force-dynamic';

const BASE_URL = 'https://www.aliyaescort.com';

const makeSlug = (raw: string) =>
  raw.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

async function fetchAllProfileSlugs(): Promise<{ slug: string; updatedAt?: string }[]> {
  try {
    const profiles = await getAllProfilesFromDynamoDB();
    const seenId = new Set<string>();
    const seenSlug = new Set<string>();
    const results: { slug: string; updatedAt?: string }[] = [];
    for (const p of profiles) {
      if (!p.id || seenId.has(p.id)) continue;
      seenId.add(p.id);
      const raw = p.seoTitle || p.name;
      if (!raw || raw === '-') continue;
      const slug = makeSlug(raw);
      if (!slug || seenSlug.has(slug)) continue;
      seenSlug.add(slug);
      results.push({ slug, updatedAt: p.updatedAt });
    }
    return results;
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`,                     lastModified: new Date(), changeFrequency: 'daily',  priority: 1.0 },
    { url: `${BASE_URL}/Hyderabad/escorts`, lastModified: new Date(), changeFrequency: 'daily',  priority: 0.95 },
  ];

  let profileRoutes: MetadataRoute.Sitemap = [];
  try {
    // Prevent long-running profile fetches from delaying sitemap generation.
    // If fetching profiles takes longer than `PROFILE_FETCH_TIMEOUT_MS`, fall
    // back to an empty list so the sitemap still returns quickly. This helps
    // avoid Google Search Console "Temporary processing error" when the
    // server is slow or the upstream API is unresponsive.
    const PROFILE_FETCH_TIMEOUT_MS = 5000;
    const profiles = (await Promise.race([
      fetchAllProfileSlugs(),
      new Promise<{ slug: string; updatedAt?: string }[]>((resolve) =>
        setTimeout(() => resolve([]), PROFILE_FETCH_TIMEOUT_MS),
      ),
    ])) as { slug: string; updatedAt?: string }[];

    profileRoutes = profiles.map(({ slug, updatedAt }) => ({
      url: `${BASE_URL}/ahmedabad/escorts/${slug}`,
      lastModified: updatedAt ? new Date(updatedAt) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.error('Sitemap profile generation error:', error);
  }

  return [...staticRoutes, ...profileRoutes];
}
