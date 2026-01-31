import { NextRequest, NextResponse } from 'next/server';  
export async function POST(req: NextRequest) {
  try {
    const apiGatewayUrl = 'https://4k1gg1dlc3.execute-api.us-east-1.amazonaws.com/dvp/upload';
    const requestBody = await req.text();
    let parsedBody;
    try {
      parsedBody = JSON.parse(requestBody);
    } catch (e) {
      return NextResponse.json({ success: false, error: 'Invalid JSON in request body' }, { status: 400 });
    }
    // Forward as array or object
    const apiResponse = await fetch(apiGatewayUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(parsedBody),
    });

    let data;
    try {
      const text = await apiResponse.text();
      if (!text) {
        throw new Error('Empty response from API Gateway');
      }
      data = JSON.parse(text);
    } catch (jsonError) {
      return NextResponse.json({ success: false, error: 'Invalid JSON from API Gateway' }, { status: 502 });
    }

    if (!apiResponse.ok) {
      return NextResponse.json({ success: false, error: 'API Gateway error', details: data }, { status: apiResponse.status });
    }

    // If input was array, always return array of results
    if (Array.isArray(parsedBody)) {
      return NextResponse.json(data);
    }
    // Otherwise, wrap in success/data
    return NextResponse.json({ success: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

