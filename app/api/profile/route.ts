import { NextResponse } from 'next/server';
import { getProfileFromDynamoDB, getProfileBySeoTitleFromDynamoDB } from '@/app/lib/dynamodb';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const name = searchParams.get('name');

  if (!id && !name) {
    return NextResponse.json({ success: false, message: 'ID or name is required' }, { status: 400 });
  }

  try {
    const profile = id
      ? await getProfileFromDynamoDB(id)
      : await getProfileBySeoTitleFromDynamoDB(name!);

    if (profile) {
      return NextResponse.json({ success: true, profile });
    } else {
      return NextResponse.json({ success: false, message: 'Profile not found' }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
