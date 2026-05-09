import { type NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow auth routes to pass through
  if (pathname.startsWith('/auth/')) {
    return NextResponse.next()
  }

  // Check for auth token in cookies
  const token = request.cookies.get('sb-access-token')?.value

  // If no token and trying to access protected routes, redirect to login
  if (!token && !pathname.startsWith('/auth/')) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
