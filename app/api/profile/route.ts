import { NextResponse } from 'next/server';
import { getProfileFromDynamoDB } from '@/app/lib/dynamodb';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ success: false, message: 'ID is required' }, { status: 400 });
  }

  try {
    const profile = await getProfileFromDynamoDB(id);
    if (profile) {
      return NextResponse.json({ success: true, profile });
    } else {
      return NextResponse.json({ success: false, message: 'Profile not found' }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
