import { MetadataRoute } from 'next';
import { getAllProfilesFromDynamoDB } from '@/app/lib/dynamodb';
import { getProfileCitySlug, getProfileSlug } from '@/app/lib/city-slugs';

// Keep the sitemap stable for crawlers while allowing profile changes to appear quickly.
export const revalidate = 300;

const BASE_URL = 'https://www.aliyaescort.com';

type SitemapProfileRoute = { city: string; slug: string; updatedAt?: string };
type SitemapStoryRoute = {
  slug?: string;
  PK?: string;
  id?: string;
  metadata?: { published?: boolean; createdAt?: string; updatedAt?: string };
};

const STORY_API_URL = 'https://4k1gg1dlc3.execute-api.us-east-1.amazonaws.com/dvp/story-list';

async function fetchAllProfileSlugs(): Promise<SitemapProfileRoute[]> {
  const profiles = await getAllProfilesFromDynamoDB({ revalidate: 300 });
  const seenId = new Set<string>();
  const seenCitySlug = new Set<string>();
  const results: SitemapProfileRoute[] = [];
  for (const p of profiles) {
    if (!p.id || seenId.has(p.id)) continue;
    seenId.add(p.id);
    if (p.isVisible === false) continue;

    const city = getProfileCitySlug(p);
    if (!city) continue;

    const slug = getProfileSlug(p);
    if (!slug) continue;

    const citySlugKey = `${city}:${slug}`;
    if (seenCitySlug.has(citySlugKey)) continue;
    seenCitySlug.add(citySlugKey);
    results.push({ city, slug, updatedAt: p.updatedAt });
  }
  return results;
}

async function fetchAllStoryRoutes(): Promise<SitemapStoryRoute[]> {
  const response = await fetch(STORY_API_URL, { next: { revalidate: 300 } });
  if (!response.ok) throw new Error(`Story list request failed: ${response.status}`);

  const data = await response.json();
  const stories = Array.isArray(data?.stories) ? data.stories as SitemapStoryRoute[] : [];
  const seen = new Set<string>();

  return stories.filter((story) => {
    if (story.metadata?.published === false) return false;
    const slug = String(story.slug || story.PK || story.id || '').trim();
    if (!slug || seen.has(slug)) return false;
    seen.add(slug);
    return true;
  });
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date().toISOString().slice(0, 10);
  const rootRoute: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/stories`, lastModified: now, changeFrequency: 'daily', priority: 0.7 },
    { url: `${BASE_URL}/stories/entertainment`, lastModified: now, changeFrequency: 'daily', priority: 0.7 },
  ];

  let profileRoutes: MetadataRoute.Sitemap = [];
  let storyRoutes: MetadataRoute.Sitemap = [];
  const [profilesResult, storiesResult] = await Promise.allSettled([
    fetchAllProfileSlugs(),
    fetchAllStoryRoutes(),
  ]);

  if (profilesResult.status === 'fulfilled') {
    profileRoutes = profilesResult.value.map(({ city, slug, updatedAt }) => ({
      url: `${BASE_URL}/${city}/escorts/${slug}`,
      lastModified: updatedAt ? new Date(updatedAt) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
  } else {
    console.error('Sitemap profile route generation error:', profilesResult.reason);
  }

  if (storiesResult.status === 'fulfilled') {
    storyRoutes = storiesResult.value.map((story) => {
      const slug = String(story.slug || story.PK || story.id);
      const lastModifiedValue = story.metadata?.updatedAt || story.metadata?.createdAt;
      return {
        url: `${BASE_URL}/stories/entertainment/${encodeURIComponent(slug)}`,
        lastModified: lastModifiedValue ? new Date(lastModifiedValue) : now,
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      };
    });
  } else {
    console.error('Sitemap story route generation error:', storiesResult.reason);
  }

  return [...rootRoute, ...profileRoutes, ...storyRoutes];
}
