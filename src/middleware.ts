import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // Only protect admin routes
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      // Redirect to login if no token
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      loginUrl.searchParams.set('error', 'admin_required')
      return NextResponse.redirect(loginUrl)
    }
    
    const payload = await verifyToken(token)
    if (!payload) {
      // Invalid token, redirect to login
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      loginUrl.searchParams.set('error', 'admin_required')
      return NextResponse.redirect(loginUrl)
    }
    
    // Token is valid, allow access
    // Note: We'll check admin status in the admin pages themselves
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*']
}