import { NextResponse } from 'next/server';
import { callUserAuthApi } from '@/app/lib/user-auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, phone, password } = body;

    if (!email || !password || !name) {
      return NextResponse.json({ success: false, message: 'Email, name, and password are required' }, { status: 400 });
    }

    const result = await callUserAuthApi({ action: 'signup', email, name, phone, password });
    return NextResponse.json(result);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Internal Server Error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
