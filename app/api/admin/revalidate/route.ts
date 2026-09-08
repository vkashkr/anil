import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { getProfileSlug } from '@/app/lib/city-slugs';

/**
 * POST /api/admin/revalidate
 * Body: { slug?: string }   — revalidates a specific profile slug
 *       {}                  — revalidates the city listing pages
 *
 * Requires admin auth cookie. Called automatically by /api/admin/profile after
 * every save, but can also be triggered manually.
 */
export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  if (cookieStore.get('auth_token')?.value !== 'authenticated') {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { slug } = await req.json().catch(() => ({})) as { slug?: string };

  if (slug) {
    const normalised = getProfileSlug({ name: slug });
    revalidatePath(`/ahmedabad/escorts/${normalised}`);
    revalidatePath(`/hyderabad/escorts/${normalised}`);
  }

  revalidatePath('/ahmedabad/escorts');
  revalidatePath('/hyderabad/escorts');
  revalidatePath('/');

  return NextResponse.json({ success: true, revalidated: slug || 'city listings' });
}
