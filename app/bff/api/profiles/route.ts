// export const dynamic = "force-static" // This line is commented out to fix the runtime error for API route
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const apiGatewayUrl = 'https://4k1gg1dlc3.execute-api.us-east-1.amazonaws.com/dvp/view';
    const apiResponse = await fetch(apiGatewayUrl, {
    });

    let data;
    try {
      data = await apiResponse.json();
    } catch (jsonError) {
      return NextResponse.json({ success: false, error: data }, { status: 502 });
    }
    return NextResponse.json({ success: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
