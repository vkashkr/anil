import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { callUserAuthApi } from '@/app/lib/user-auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { credential } = body;

    if (!credential) {
      return NextResponse.json({ success: false, message: 'Google credential is required' }, { status: 400 });
    }

    const result = await callUserAuthApi({ action: 'google_signin', credential });

    if (result.success && result.user) {
      const cookieStore = await cookies();
      cookieStore.set('user_token', JSON.stringify({ email: result.user.email, name: result.user.name }), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    return NextResponse.json(result);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Internal Server Error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
