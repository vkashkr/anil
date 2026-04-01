import { NextResponse } from 'next/server';
import { saveProfileToDynamoDB, Profile } from '@/app/lib/dynamodb';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { action, profile } = data; // action: 'save' | 'publish'

    if (!profile || !profile.id) {
      return NextResponse.json({ success: false, message: 'Invalid profile data' }, { status: 400 });
    }

    // Delegate to API Gateway via shared lib
    // The API Gateway (Lambda) handles both DynamoDB save and S3 publishing logic.
    const result = await saveProfileToDynamoDB(profile, action);

    // If API Gateway returns success, we just forward the response
    return NextResponse.json(result);
  } catch (error) {
    console.error('Admin API Error:', error);
    return NextResponse.json({ success: false, message: 'Failed to process request' }, { status: 500 });
  }
}
