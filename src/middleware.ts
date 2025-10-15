import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ROUTES } from './constants/routes'

// Define role-based access control
const ROLE_ACCESS = {
  admin: {
    allowedPaths: ['/lab', '/welders', '/public'],
    description: 'Can access all application pages'
  },
  welding_coordinator: {
    allowedPaths: ['/welders', '/public'],
    description: 'Can access only welder-related pages'
  },
  lab_engg: {
    allowedPaths: ['/lab', '/public'],
    description: 'Can access only lab-related pages'
  }
}

// Helper function to check if user has access to a path
function hasAccessToPath(userRole: string, pathname: string): boolean {
  const roleConfig = ROLE_ACCESS[userRole as keyof typeof ROLE_ACCESS]
  if (!roleConfig) return false

  return roleConfig.allowedPaths.some(allowedPath => 
    pathname.startsWith(allowedPath)
  )
}

// Helper function to get user role from token (simplified JWT parsing)
function getUserRoleFromToken(request: NextRequest): string | null {
  try {
    const accessToken = request.cookies.get('accessToken')?.value
    if (!accessToken) return null

    // Simple JWT payload parsing (without verification for middleware)
    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]))
      return payload.role || null
    } catch {
      return null
    }
  } catch (error) {
    console.error('Error getting user role:', error)
    return null
  }
}

// Helper function to get home route for role
function getHomeRouteForRole(role: string): string {
  switch (role) {
    case 'admin':
      return ROUTES.APP.DASHBOARD
    case 'welding_coordinator':
      return ROUTES.APP.WELDERS.DASHBOARD
    case 'lab_engg':
      return ROUTES.APP.DASHBOARD
    default:
      return ROUTES.AUTH.LOGIN
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow access to auth pages
  if (pathname.startsWith('/login') || 
      pathname.startsWith('/register') ||
      pathname.startsWith('/forgot-password')) {
    return NextResponse.next()
  }

  // Allow access to public pages
  if (pathname.startsWith('/public/')) {
    return NextResponse.next()
  }

  // Allow access to API routes
  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // Allow access to static files
  if (pathname.startsWith('/_next/') || 
      pathname.startsWith('/favicon.ico') ||
      pathname.startsWith('/gripco-logo.webp')) {
    return NextResponse.next()
  }

  // Check if user is authenticated and has proper role
  const userRole = getUserRoleFromToken(request)
  
  if (!userRole) {
    // No valid token or role, redirect to login
    return NextResponse.redirect(new URL(ROUTES.AUTH.LOGIN, request.url))
  }

  // Check if user has access to the requested path
  if (!hasAccessToPath(userRole, pathname)) {
    // User doesn't have access to this path, redirect to appropriate dashboard
    const homeRoute = getHomeRouteForRole(userRole)
    return NextResponse.redirect(new URL(homeRoute, request.url))
  }

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
