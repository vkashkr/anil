import { MetadataRoute } from 'next';

type Profile = {
  id: string | number;
  name: string;
  filename?: string;
  metadata?: any;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.aliyaescort.com'; // Adjust domain as needed

  // Static routes
  const staticRoutes = [
    '',
    '/login',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.5,
  }));

  // Fetch dynamic profiles
  let profileRoutes: MetadataRoute.Sitemap = [];
  try {
    const apiGatewayUrl = 'https://4k1gg1dlc3.execute-api.us-east-1.amazonaws.com/dvp/view';
    // Revalidation: 3600 seconds (1 hour) to keep sitemap fresh but performant
    const res = await fetch(apiGatewayUrl, { next: { revalidate: 3600 } });
    
    if (!res.ok) {
        throw new Error(`Failed to fetch profiles: ${res.status}`);
    }

    const data = await res.json();
    
    if (data && data.images && Array.isArray(data.images)) {
        // Map raw data to Profile type (Mirroring logic from page.tsx)
        const mapped = data.images.map((img: any) => ({
            id: (img.metadata && img.metadata.id) || (img.filename ? img.filename.split('/')[0] : img.filename),
            name: img.metadata?.name || "-",
            filename: img.filename,
            metadata: img.metadata || {},
        }));

        // Group by id to get unique profiles
        const grouped: { [id: string]: Profile[] } = {};
        const metaById: { [id: string]: any } = {};

        mapped.forEach((profile: Profile) => {
            const pid = String(profile.id);
            if (!grouped[pid]) grouped[pid] = [];
            grouped[pid].push(profile);

            // Prioritize metadata from 'profile.jpg' if available (same logic as main page)
            if (profile.filename && profile.filename.endsWith('profile.jpg')) {
                metaById[pid] = profile.metadata;
            }
        });

        // Now we have unique IDs. We need one entry per ID.
        // We take the first image or the one with metadata (after consolidation logic)
        // Since we just need the Name and ID for the URL, we can pick the representative profile.
        
        profileRoutes = Object.keys(grouped).map((id) => {
            // Apply metadata if found (to get correct name)
            let representative = grouped[id][0];
            if (metaById[id]) {
                representative = { ...representative, ...metaById[id] };
            }
            
            const slug = (representative.name || 'profile').replace(/\s+/g, '-').toLowerCase();
            
            return {
                url: `${baseUrl}/profile?id=${id}&amp;name=${encodeURIComponent(slug)}`,
                lastModified: new Date(),
                changeFrequency: 'daily' as const,
                priority: 0.8,
            };
        });
    }

  } catch (error) {
    console.error('Error generating sitemap:', error);
  }

  return [...staticRoutes, ...profileRoutes];
}
