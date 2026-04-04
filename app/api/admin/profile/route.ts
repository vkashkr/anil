import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { saveProfileToDynamoDB, deleteProfileFromDynamoDB, Profile } from '@/app/lib/dynamodb';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { action, profile, id } = data;

    // Delete profile: remove from DynamoDB + S3 HTML (via Lambda)
    if (action === 'delete_profile') {
      const profileId = id || profile?.id;
      if (!profileId) {
        return NextResponse.json({ success: false, message: 'Missing id' }, { status: 400 });
      }
      const result = await deleteProfileFromDynamoDB(profileId);
      revalidatePath('/');
      revalidatePath('/ahmedabad-escort');
      return NextResponse.json(result);
    }

    if (!profile || !profile.id) {
      return NextResponse.json({ success: false, message: 'Invalid profile data' }, { status: 400 });
    }

    // Delegate to API Gateway via shared lib
    // The API Gateway (Lambda) handles both DynamoDB save and S3 publishing logic.
    const result = await saveProfileToDynamoDB(profile, action);

    // Bust the Next.js cache for this profile's slug page so changes appear immediately
    if (result?.success !== false && profile.name) {
      const slug = profile.name.trim().toLowerCase().replace(/\s+/g, '-');
      revalidatePath(`/ahmedabad-escort/${slug}`);
      revalidatePath('/ahmedabad-escort');
    }

    // If API Gateway returns success, we just forward the response
    return NextResponse.json(result);
  } catch (error) {
    console.error('Admin API Error:', error);
    return NextResponse.json({ success: false, message: 'Failed to process request' }, { status: 500 });
  }
}
