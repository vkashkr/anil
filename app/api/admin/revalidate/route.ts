import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

/**
 * POST /api/admin/revalidate
 * Body: { slug?: string }   — revalidates a specific profile slug
 *       {}                  — revalidates the entire /ahmedabad-escort category
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
    const normalised = slug.trim().toLowerCase().replace(/\s+/g, '-');
    revalidatePath(`/ahmedabad-escort/${normalised}`);
  }

  // Always revalidate the category listing page
  revalidatePath('/ahmedabad-escort');

  return NextResponse.json({ success: true, revalidated: slug ? `/ahmedabad-escort/${slug}` : '/ahmedabad-escort' });
}
