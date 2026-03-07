import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Define protected routes
  const protectedRoutes = ['/upload', '/view', '/admin'];

  // Check if the current route is protected (starts with any of the protected routes)
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  if (isProtectedRoute) {
    const authToken = request.cookies.get('auth_token')?.value;

    if (!authToken) {
      // Redirect to login page if token is missing
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

// Configure proxy to match specific paths for better performance
export const config = {
  matcher: ['/upload/:path*', '/view/:path*', '/admin/:path*'],
};
