import { NextRequest, NextResponse } from 'next/server';

const LAMBDA_BASE = 'https://4k1gg1dlc3.execute-api.us-east-1.amazonaws.com/dvp';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const limit = Math.max(1, Math.min(50, Number(searchParams.get('limit')) || 5));

  const res = await fetch(`${LAMBDA_BASE}/story-list`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    return NextResponse.json(
      { success: false, error: `Lambda ${res.status}` },
      { status: res.status },
    );
  }

  const data = await res.json();
  const all: unknown[] = Array.isArray(data?.stories) ? data.stories : [];

  const total = all.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const stories = all.slice(start, start + limit);

  return NextResponse.json({
    success: true,
    stories,
    page,
    limit,
    total,
    totalPages,
  });
}
