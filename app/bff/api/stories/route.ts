import { NextRequest, NextResponse } from 'next/server';

const LAMBDA_BASE = 'https://4k1gg1dlc3.execute-api.us-east-1.amazonaws.com/dvp';

/**
 * GET /bff/api/stories?id=story-001
 * Fetches a single story by PK from Lambda → DynamoDB story-gif table.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const all = searchParams.get('all'); // ?all=true returns all items sharing the same PK

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing 'id' query parameter" }, { status: 400 });
    }

    const endpoint = all === 'true' ? 'stories' : 'story';
    const apiResponse = await fetch(`${LAMBDA_BASE}/${endpoint}?id=${encodeURIComponent(id)}`);

    const data = await apiResponse.json().catch(() => null);
    if (!apiResponse.ok || !data) {
      return NextResponse.json(
        { success: false, error: data?.error ?? 'Lambda error' },
        { status: apiResponse.status }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

/**
 * POST /bff/api/stories
 * Saves or updates a story in DynamoDB. Uploads any base64 images to S3.
 * Body: full story JSON matching the story_1.json schema.
 */
export async function POST(req: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 });
    }

    const storyId = (body as Record<string, unknown>)?.id;
    if (!storyId) {
      return NextResponse.json({ success: false, error: "Missing 'id' in story data" }, { status: 400 });
    }

    const apiResponse = await fetch(`${LAMBDA_BASE}/story`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await apiResponse.json().catch(() => null);
    if (!apiResponse.ok || !data) {
      return NextResponse.json(
        { success: false, error: data?.error ?? 'Lambda error' },
        { status: apiResponse.status }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
