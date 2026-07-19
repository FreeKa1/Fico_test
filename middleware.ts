import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED = ['/', '/random', '/category', '/profile'];
const PUBLIC = ['/login', '/register', '/admin'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authCookie = request.cookies.get('auth_user')?.value;

  // Admin routes are separate
  if (pathname.startsWith('/admin')) return NextResponse.next();

  // Protected routes require login
  const isProtected = PROTECTED.some((p) => pathname === p || pathname.startsWith(p + '/'));
  if (isProtected && !authCookie) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Already logged in → redirect away from login/register
  if (PUBLIC.some((p) => pathname.startsWith(p)) && authCookie) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
