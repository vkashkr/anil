import { NextRequest, NextResponse } from 'next/server';

// You need to install aws-sdk if not already installed
// import AWS from 'aws-sdk';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';

// Lambda client config (update region and credentials as needed)
const lambda = new LambdaClient({ region: 'us-east-1' });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Set your Lambda function name
    const functionName = 'aliya-lambda';

    // Wrap payload in { body: ... } to match lambda.py expectations
    const lambdaPayload = JSON.stringify({ body: JSON.stringify(body) });

    const command = new InvokeCommand({
      FunctionName: functionName,
      Payload: Buffer.from(lambdaPayload),
    });

    const response = await lambda.send(command);
    const responsePayload = response.Payload
      ? JSON.parse(Buffer.from(response.Payload).toString())
      : null;

    return NextResponse.json({ success: true, data: responsePayload });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
