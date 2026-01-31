import { NextRequest, NextResponse } from 'next/server';

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { filename, image, metadata } = body;
    if (!filename || !image) {
      return NextResponse.json({ success: false, error: 'Missing filename or image' }, { status: 400 });
    }
    const apiGatewayUrl = 'https://4k1gg1dlc3.execute-api.us-east-1.amazonaws.com/dvp/update-image';
    const apiResponse = await fetch(apiGatewayUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename, image, metadata }),
    });
    const data = await apiResponse.json();
    if (!apiResponse.ok) {
      return NextResponse.json({ success: false, error: data.error || 'Update failed' }, { status: apiResponse.status });
    }
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
