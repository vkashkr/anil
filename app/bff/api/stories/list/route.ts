import { NextResponse } from 'next/server';
import storyFallback from '@/public/data/story_1.json';

const LAMBDA_BASE = 'https://4k1gg1dlc3.execute-api.us-east-1.amazonaws.com/dvp';

export async function GET() {
  try {
    const res = await fetch(`${LAMBDA_BASE}/story-list`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) throw new Error(`Lambda ${res.status}`);

    const data = await res.json();
    const stories: unknown[] = Array.isArray(data?.stories) ? data.stories : [];

    return NextResponse.json({ success: true, stories });
  } catch {
    // Fallback to local JSON so the page always renders
    return NextResponse.json({
      success: true,
      stories: [storyFallback],
      fallback: true,
    });
  }
}
