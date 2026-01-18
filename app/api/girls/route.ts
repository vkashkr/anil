import { NextResponse } from 'next/server';
import AWS from 'aws-sdk';

const lambda = new AWS.Lambda({
    region: 'us-east-1', // Change to your region
    // credentials can be set via environment variables or AWS config
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