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
    { url: `${BASE_URL}/ahmedabad/escorts`, lastModified: new Date(), changeFrequency: 'daily',  priority: 0.95 },
  ];

  let profileRoutes: MetadataRoute.Sitemap = [];
  try {
    const profiles = await fetchAllProfileSlugs();
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
