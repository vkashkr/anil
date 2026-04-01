import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function DELETE(req: NextRequest) {
  const cookieStore = await cookies();
  if (!cookieStore.get('auth_token')) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(req.url);
    const filename = searchParams.get('filename');
    if (!filename) {
      return NextResponse.json({ success: false, error: 'Missing filename' }, { status: 400 });
    }
    const apiGatewayUrl = `https://4k1gg1dlc3.execute-api.us-east-1.amazonaws.com/dvp/delete-image?filename=${encodeURIComponent(filename)}`;
    const apiResponse = await fetch(apiGatewayUrl, { method: 'DELETE' });
    const data = await apiResponse.json();
    if (!apiResponse.ok) {
      return NextResponse.json({ success: false, error: data.error || 'Delete failed' }, { status: apiResponse.status });
    }
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
