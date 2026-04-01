import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { callUserAuthApi } from '@/app/lib/user-auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'Email and password are required' }, { status: 400 });
    }

    const result = await callUserAuthApi({ action: 'login', email, password });

    if (result.success) {
      const cookieStore = await cookies();
      cookieStore.set('user_token', JSON.stringify({ email: result.user.email, name: result.user.name, role: result.user.role }), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      // If admin, also set auth_token for admin panel access
      if (result.user.role === 'admin') {
        cookieStore.set('auth_token', 'authenticated', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          path: '/',
          maxAge: 60 * 60 * 24, // 1 day
        });
      }
    }

    return NextResponse.json(result);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Internal Server Error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
