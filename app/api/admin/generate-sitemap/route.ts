import { getAllProfilesFromDynamoDB } from '@/app/lib/dynamodb';
import { uploadHtmlToS3 } from '@/app/lib/s3-html';
import { getProfileCitySlug, getProfileSlug } from '@/app/lib/city-slugs';

const BASE_URL = 'https://www.aliyaescort.com';

function escapeXml(value: string): string {
    return value.replace(/[<>&'\"]/g, (character) => ({
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        "'": '&apos;',
        '"': '&quot;',
    })[character] || character);
}

export async function POST(request: Request) {
    try {
        // Prevent long-running profile fetches from causing a 500.
        const PROFILE_FETCH_TIMEOUT_MS = 30_000;
        const profiles = (await Promise.race([
            getAllProfilesFromDynamoDB(),
            new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error('Profile fetch timed out')), PROFILE_FETCH_TIMEOUT_MS),
            ),
        ])) as any[];

        const seen = new Set<string>();
        const profileUrls = profiles
            .filter((profile) => profile.isVisible !== false)
            .map((profile) => {
                const city = getProfileCitySlug(profile);
                const slug = getProfileSlug(profile);
                return city && slug ? `${BASE_URL}/${city}/escorts/${slug}` : null;
            })
            .filter((url): url is string => url !== null)
            .filter((url) => {
                if (seen.has(url)) return false;
                seen.add(url);
                return true;
            });

        if (profileUrls.length === 0) {
            throw new Error('Profile scan returned no canonical URLs; existing sitemap was not replaced');
        }

        const cityUrls = ['ahmedabad', 'hyderabad'].map((city) => `${BASE_URL}/${city}/escorts`);
        const urls = [...cityUrls, ...profileUrls];
        
        // Generate sitemap.xml content
        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>${BASE_URL}/</loc>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
    </url>
    ${urls.map(url => `
    <url>
        <loc>${escapeXml(url)}</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <changefreq>daily</changefreq>
        <priority>0.8</priority>
    </url>`).join('')}
</urlset>`;

        // Upload to S3 (best-effort)
        try {
            await uploadHtmlToS3('sitemap.xml', sitemap, 'application/xml');
        } catch (uploadErr) {
            console.error('Sitemap upload error:', uploadErr);
        }

        return new Response(JSON.stringify({ success: true, message: 'Sitemap updated' }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200,
        });
    } catch (error) {
        console.error('generate-sitemap error:', error);
        // Return 200 with error details to avoid transient 5xx for consumers
        // that may interpret 5xx as a temporary processing error.
        return new Response(JSON.stringify({ success: false, error: String(error) }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200,
        });
    }
}
