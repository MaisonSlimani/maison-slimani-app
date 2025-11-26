import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { SignJWT, jwtVerify } from 'jose'

const secretKey = process.env.ADMIN_SESSION_SECRET || 'default-secret-change-in-production'
const encodedKey = new TextEncoder().encode(secretKey)

async function verifySession(session: string | undefined): Promise<boolean> {
  if (!session) return false

  try {
    await jwtVerify(session, encodedKey)
    return true
  } catch {
    return false
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const url = request.nextUrl.clone()

  // Protéger les routes admin
  if (pathname.startsWith('/admin')) {
    const session = request.cookies.get('admin_session')?.value
    const isValid = await verifySession(session)

    if (!isValid && pathname !== '/login') {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    if (isValid && pathname === '/login') {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  }

  // Redirection si accès à /login alors que déjà connecté
  if (pathname === '/login') {
    const session = request.cookies.get('admin_session')?.value
    const isValid = await verifySession(session)

    if (isValid) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  }

  // PWA Detection and Routing
  // Don't redirect API routes, admin routes, or static files
  if (
    !pathname.startsWith('/api') &&
    !pathname.startsWith('/admin') &&
    !pathname.startsWith('/_next') &&
    !pathname.startsWith('/login') &&
    !pathname.startsWith('/sw') && // Allow service worker
    !pathname.match(/\.(ico|png|jpg|jpeg|gif|svg|webp|woff|woff2|ttf|eot|js)$/) // Allow .js files including sw.js
  ) {
    // Clear PWA cookie if requested
    if (url.searchParams.get('clear-pwa') === 'true') {
      const response = NextResponse.next()
      response.cookies.delete('pwa-mode')
      return response
    }

    // Check if PWA mode
    // Only activate PWA mode via explicit URL parameter or standalone user-agent
    // Cookie is only used to prevent redirects when already in PWA mode
    const hasPwaParam = url.searchParams.get('pwa') === 'true'
    const isStandalone = request.headers.get('user-agent')?.includes('standalone')
    const isOnPwaRoute = pathname.startsWith('/pwa')
    const hasPwaCookie = request.cookies.get('pwa-mode')?.value === 'true'
    
    // Enter PWA mode only via URL parameter or standalone
    // Cookie prevents redirects when navigating within PWA
    const isPWA = hasPwaParam || isStandalone || (isOnPwaRoute && hasPwaCookie)

    // If in PWA mode and not already on /pwa route, rewrite to /pwa
    if (isPWA && !pathname.startsWith('/pwa')) {
      url.pathname = `/pwa${pathname === '/' ? '' : pathname}`
      return NextResponse.rewrite(url)
    }

    // If not in PWA mode but on /pwa route, redirect to web version
    if (!isPWA && pathname.startsWith('/pwa')) {
      url.pathname = pathname.replace('/pwa', '') || '/'
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/login',
    // Exclude static files including service worker
    '/((?!_next/static|_next/image|favicon.ico|sw\\.js|manifest\\.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff|woff2|ttf|eot|js)$).*)',
  ],
}

