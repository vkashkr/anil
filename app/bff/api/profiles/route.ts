// export const dynamic = "force-static" // This line is commented out to fix the runtime error for API route
import { NextRequest, NextResponse } from 'next/server';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';

const lambda = new LambdaClient({ region: 'us-east-1' });

export async function GET(req: NextRequest) {
  try {
    // Prepare event for GET method
    const payload = JSON.stringify({ httpMethod: 'GET' });
    const command = new InvokeCommand({
      FunctionName: 'aliya-lambda',
      Payload: Buffer.from(payload),
    });
    const response = await lambda.send(command);
    const responsePayload = response.Payload
      ? JSON.parse(Buffer.from(response.Payload).toString())
      : null;
    return NextResponse.json(responsePayload);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
