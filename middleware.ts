import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Protect /add route - redirect to login if no session
  if (path.startsWith('/add')) {
    const session = request.cookies.get('session')?.value;
    if (!session) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', path);
      return NextResponse.redirect(loginUrl.toString(), 302);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/add/:path*'],
};
