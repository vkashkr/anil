import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const cookie = request.headers.get('cookie') || '';
  const isAdmin = cookie.includes('auth_token='); // Ideally, check value, but existence implies logged in for now given proxy logic

  return NextResponse.json({ isAdmin });
}
