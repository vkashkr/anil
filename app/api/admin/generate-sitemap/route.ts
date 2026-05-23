import { getAllProfilesFromDynamoDB } from '@/app/lib/dynamodb';
import { uploadHtmlToS3 } from '@/app/lib/s3-html';

export async function POST(request: Request) {
    try {
        // Prevent long-running profile fetches from causing a 500.
        const PROFILE_FETCH_TIMEOUT_MS = 8000;
        const profiles = (await Promise.race([
            getAllProfilesFromDynamoDB(),
            new Promise<typeof getAllProfilesFromDynamoDB>(() =>
                // resolve to an empty array after timeout
                setTimeout(() => [], PROFILE_FETCH_TIMEOUT_MS),
            ),
        ])) as any[];
        
        // Generate sitemap.xml content
        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>https://www.aliyaescort.com/</loc>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
    </url>
    ${profiles.map(p => `
    <url>
        <loc>https://www.aliyaescort.com/ahmedabad/escorts/${(p.name || '').trim().toLowerCase().replace(/\s+/g, '-')}</loc>
        <lastmod>${p.updatedAt || new Date().toISOString()}</lastmod>
        <changefreq>daily</changefreq>
        <priority>0.8</priority>
    </url>`).join('')}
</urlset>`;

        // Upload to S3 (best-effort)
        try {
            await uploadHtmlToS3('sitemap.xml', sitemap);
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
