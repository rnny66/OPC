export type RouteType = 'public' | 'protected' | 'organizer' | 'admin'

const AUTH_ROUTES = ['/login', '/signup']
const VERIFY_ROUTES_PREFIX = '/verify-'
const PROTECTED_ROUTES = ['/dashboard', '/profile']
const PROTECTED_PREFIXES = ['/profile/', '/tournaments/']
const ORGANIZER_PREFIX = '/organizer'
const ADMIN_PREFIX = '/admin'

function isProtectedRoute(pathname: string): boolean {
  if (PROTECTED_ROUTES.includes(pathname)) return true
  if (PROTECTED_PREFIXES.some(p => pathname.startsWith(p) && pathname.includes('/register'))) return true
  if (pathname.startsWith('/profile/')) return true
  return false
}

export function classifyRoute(pathname: string): RouteType {
  if (pathname.startsWith(ADMIN_PREFIX)) return 'admin'
  if (pathname.startsWith(ORGANIZER_PREFIX)) return 'organizer'
  if (isProtectedRoute(pathname)) return 'protected'
  if (AUTH_ROUTES.includes(pathname)) return 'public'
  if (pathname.startsWith(VERIFY_ROUTES_PREFIX)) return 'public'
  return 'public'
}
