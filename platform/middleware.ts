import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { classifyRoute } from '@/lib/auth/routes'

export async function middleware(request: NextRequest) {
  const { user, response } = await updateSession(request)
  const routeType = classifyRoute(request.nextUrl.pathname)

  // Public routes — always accessible
  if (routeType === 'public') {
    // Redirect logged-in users away from auth pages
    if (user && ['/login', '/signup'].includes(request.nextUrl.pathname)) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return response
  }

  // All other routes require authentication
  if (!user) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Role-gated routes — need to check profile
  if (routeType === 'organizer' || routeType === 'admin') {
    const { supabase } = await updateSession(request)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (routeType === 'organizer' && profile?.role !== 'organizer' && profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    if (routeType === 'admin' && profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
