import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    let apiGatewayUrl = 'https://4k1gg1dlc3.execute-api.us-east-1.amazonaws.com/dvp/get-profiles';
    if (id) {
      apiGatewayUrl += `?id=${encodeURIComponent(id)}`;
    }
    const apiResponse = await fetch(apiGatewayUrl);
    

    let data;
    try {
      data = await apiResponse.json();
    } catch (jsonError) {
      return NextResponse.json({ success: false, error: data }, { status: 502 });
    }
    return NextResponse.json({ success: true, data }, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=600' },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
