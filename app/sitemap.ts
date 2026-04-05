import { MetadataRoute } from 'next';
import { getAllProfilesFromDynamoDB } from '@/app/lib/dynamodb';

const BASE_URL = 'https://www.aliyaescort.com';

async function fetchAllProfileSlugs(): Promise<string[]> {
  try {
    const profiles = await getAllProfilesFromDynamoDB();
    const seen = new Set<string>();
    const slugs: string[] = [];
    for (const p of profiles) {
      if (!p.id || seen.has(p.id)) continue;
      seen.add(p.id);
      const raw = p.seoTitle || p.name || '';
      if (!raw || raw === '-') continue;
      const slug = raw.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      if (slug) slugs.push(slug);
    }
    return slugs;
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`,                          lastModified: new Date(), changeFrequency: 'daily',  priority: 1.0 },
    { url: `${BASE_URL}/ahmedabad/escorts`,      lastModified: new Date(), changeFrequency: 'daily',  priority: 0.95 },
  ];

  // Fetch dynamic profiles and build profile routes
  let profileRoutes: MetadataRoute.Sitemap = [];
  try {
    const slugs = await fetchAllProfileSlugs();
    // Fix #5 — clean path-based URLs instead of ?name= query params (better for indexing)
    profileRoutes = slugs.map((slug) => ({
      url: `${BASE_URL}/ahmedabad/escorts/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.error('Sitemap profile generation error:', error);
  }

  return [...staticRoutes, ...profileRoutes];
}
