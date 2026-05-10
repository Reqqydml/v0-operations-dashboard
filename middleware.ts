import { type NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/auth/')) {
    return NextResponse.next()
  }

  if (pathname.startsWith('/onboarding')) {
    return NextResponse.next()
  }

  // Supabase v2 stores session as sb-<project-ref>-auth-token
  // Check for any cookie that matches the pattern
  const hasSupabaseSession = request.cookies.getAll().some(
    (cookie) => cookie.name.startsWith('sb-') && cookie.name.endsWith('-auth-token')
  )

  if (!hasSupabaseSession) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)',],
}