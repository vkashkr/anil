import { getAllProfilesFromDynamoDB } from '@/app/lib/dynamodb';
import { uploadHtmlToS3 } from '@/app/lib/s3-html';

export async function POST(request: Request) {
    try {
        const profiles = await getAllProfilesFromDynamoDB();
        
        // Generate sitemap.xml content
        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>https://aliyaescort.com/ahmedabad/</loc>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
    </url>
    ${profiles.map(p => `
    <url>
        <loc>https://aliyaescort.com/ahmedabad/escorts/${(p.name || '').trim().toLowerCase().replace(/\s+/g, '-')}-independent-escort</loc>
        <lastmod>${p.updatedAt || new Date().toISOString()}</lastmod>
        <changefreq>daily</changefreq>
        <priority>0.8</priority>
    </url>`).join('')}
</urlset>`;

        // Upload to S3
        await uploadHtmlToS3('sitemap.xml', sitemap);
        
        return new Response(JSON.stringify({ success: true, message: 'Sitemap updated' }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200,
        });
    } catch (error) {
        return new Response(JSON.stringify({ success: false, error: String(error) }), { status: 500 });
    }
}
