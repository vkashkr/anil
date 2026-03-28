import { MetadataRoute } from 'next';

const BASE_URL = 'https://ahmedabad.aliyaescort.com';
const API_BASE = 'https://4k1gg1dlc3.execute-api.us-east-1.amazonaws.com/dvp';

async function fetchAllProfileNames(): Promise<string[]> {
  const names = new Set<string>();
  let nextToken: string | null = null;

  // Paginate through all profiles
  do {
    const url: string = nextToken
      ? `${API_BASE}/view?limit=100&next_token=${encodeURIComponent(nextToken)}`
      : `${API_BASE}/view?limit=100`;

    const res: Response = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) break;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = await res.json();
    if (!data?.images || !Array.isArray(data.images)) break;

    // Collect unique names from metadata
    const seenIds = new Set<string>();
    for (const img of data.images) {
      const id = String(
        (img.metadata && img.metadata.id) ||
        (img.filename ? img.filename.split('/')[0] : '')
      );
      const name: string = img.metadata?.name || '';
      if (id && name && name !== '-' && !seenIds.has(id)) {
        seenIds.add(id);
        const slug = name.trim().toLowerCase().replace(/\s+/g, '-');
        if (slug) names.add(slug);
      }
    }

    nextToken = data.next_token || null;
  } while (nextToken);

  return Array.from(names);
}

interface StoryItem {
  PK: string;
  slug: string;
  title: string;
  updatedAt?: string;
}

async function fetchAllStories(): Promise<StoryItem[]> {
  const res = await fetch(`${API_BASE}/story-list`, { next: { revalidate: 3600 } });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data?.stories) ? (data.stories as StoryItem[]) : [];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL,              lastModified: new Date(), changeFrequency: 'daily',  priority: 1.0 },
    { url: `${BASE_URL}/stories`, lastModified: new Date(), changeFrequency: 'daily',  priority: 0.7 },
  ];

  // Fetch dynamic profiles and build profile routes
  let profileRoutes: MetadataRoute.Sitemap = [];
  try {
    const profileNames = await fetchAllProfileNames();
    profileRoutes = profileNames.map((slug) => ({
      url: `${BASE_URL}/profile?name=${encodeURIComponent(slug)}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.error('Sitemap profile generation error:', error);
  }

  // Fetch all stories and build story routes
  let storyRoutes: MetadataRoute.Sitemap = [];
  try {
    const stories = await fetchAllStories();
    storyRoutes = stories.map((story) => ({
      url: `${BASE_URL}/stories/entertainment?id=${encodeURIComponent(story.PK)}`,
      lastModified: story.updatedAt ? new Date(story.updatedAt) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));
  } catch (error) {
    console.error('Sitemap story generation error:', error);
  }

  return [...staticRoutes, ...profileRoutes, ...storyRoutes];
}
