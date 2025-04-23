import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define the role-based route configuration
const roleRoutes = {
  admin: [
    '/dashboard', 
    '/dashboard/settings', 
    '/dashboard/reports',
    '/dashboard/employees',
    '/dashboard/orders',
    '/dashboard/clients',
    '/dashboard/inventory',
    '/dashboard/payments',
    '/dashboard/reception',
    '/dashboard/designer',
    '/dashboard/cashier'
  ],
  accueil: [
    '/dashboard', 
    '/dashboard/reception', 
    '/dashboard/reception/new-order', 
    '/dashboard/orders', 
    '/dashboard/clients',
    '/dashboard/inventory'
  ],
  caisse: [
    '/dashboard', 
    '/dashboard/cashier', 
    '/dashboard/payments',
    '/dashboard/orders'
  ],
  graphiste: [
    '/dashboard', 
    '/dashboard/designer', 
    '/dashboard/inventory',
    '/dashboard/orders'
  ],
}

// Define public routes that don't require authentication
const publicRoutes = ['/login', '/register', '/forgot-password']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public routes
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // Get the user's role from the session/token
  // This is a placeholder - you'll need to implement your actual auth logic
  const userRole = request.cookies.get('userRole')?.value

  // If no role is found, redirect to login
  if (!userRole) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Check if the user has access to the requested route
  const allowedRoutes = roleRoutes[userRole as keyof typeof roleRoutes] || []
  const hasAccess = allowedRoutes.some(route => pathname.startsWith(route))

  if (!hasAccess) {
    // Redirect to the role's default dashboard or show an unauthorized page
    return NextResponse.redirect(new URL(`/dashboard/${userRole}`, request.url))
  }

  return NextResponse.next()
}

// Configure which routes to run the middleware on
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login',
    '/register',
    '/forgot-password',
  ],
} 