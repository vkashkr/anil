import { NextResponse } from 'next/server';
import AWS from 'aws-sdk';

// Configure AWS SDK with environment variables or IAM role
const lambda = new AWS.Lambda({
  region: 'us-east-1',
  // credentials will be picked up from environment or IAM role
  accessKeyId: process.env.MY_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.MY_AWS_SECRET_ACCESS_KEY,
  
});

export async function GET() {
  try {
    const params = {
      FunctionName: 'aliya-lambda',
      InvocationType: 'RequestResponse',
      Payload: JSON.stringify({}), // Add payload if needed
    };

    const result = await lambda.invoke(params).promise();
    const payload = result.Payload ? JSON.parse(result.Payload as string) : {};
    // return body as JSON response
    return NextResponse.json(payload.body);
  } catch (error) {
    console.error('Error invoking Lambda:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}