import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/auth/login',
    '/signup',
    '/forms',
  ]

  // Check if the route starts with /forms/ (public forms)
  const isPublicForm = pathname.startsWith('/forms/')

  // Check if it's a public route or public form
  const isPublic = publicRoutes.includes(pathname) || isPublicForm

  if (isPublic) {
    return NextResponse.next()
  }

  // For protected routes, check if access_token cookie exists
  const token = request.cookies.get('access_token')?.value

  if (!token) {
    // Redirect to login
    const loginUrl = new URL('/auth/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // Token exists, allow the request
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}