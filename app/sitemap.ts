import { MetadataRoute } from 'next';

const BASE_URL = 'https://ahmedabad.aliyaescort.com';
const API_BASE = 'https://4k1gg1dlc3.execute-api.us-east-1.amazonaws.com/dvp';

// Fix #3 / #14 — AbortController timeout prevents sitemap generation from hanging
// and causing Google Search Console "Temporary processing error"
async function fetchWithTimeout(url: string, timeoutMs = 7000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal, next: { revalidate: 3600 } });
  } finally {
    clearTimeout(timer);
  }
}

async function fetchAllProfileSlugs(): Promise<string[]> {
  const slugs = new Set<string>();
  let nextToken: string | null = null;

  // Paginate through all profiles
  do {
    const url: string = nextToken
      ? `${API_BASE}/view?limit=100&next_token=${encodeURIComponent(nextToken)}`
      : `${API_BASE}/view?limit=100`;

    let res: Response;
    try {
      res = await fetchWithTimeout(url);
    } catch {
      break; // timeout or network error — stop pagination early
    }
    if (!res.ok) break;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = await res.json();
    if (!data?.images || !Array.isArray(data.images)) break;

    // Collect unique name slugs
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
        if (slug) slugs.add(slug);
      }
    }

    nextToken = data.next_token || null;
  } while (nextToken);

  return Array.from(slugs);
}

interface StoryItem {
  PK: string;
  slug: string;
  title: string;
  updatedAt?: string;
}

async function fetchAllStories(): Promise<StoryItem[]> {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/story-list`);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data?.stories) ? (data.stories as StoryItem[]) : [];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`,                          lastModified: new Date(), changeFrequency: 'daily',  priority: 1.0 },
    { url: `${BASE_URL}/ahmedabad-escort`,          lastModified: new Date(), changeFrequency: 'daily',  priority: 0.95 },
  ];

  // Fetch dynamic profiles and build profile routes
  let profileRoutes: MetadataRoute.Sitemap = [];
  try {
    const slugs = await fetchAllProfileSlugs();
    // Fix #5 — clean path-based URLs instead of ?name= query params (better for indexing)
    profileRoutes = slugs.map((slug) => ({
      url: `${BASE_URL}/ahmedabad-escort/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.error('Sitemap profile generation error:', error);
  }

  return [...staticRoutes, ...profileRoutes];
}
