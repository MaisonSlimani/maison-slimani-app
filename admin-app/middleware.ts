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

  // Create response
  let response: NextResponse

  // Allow public routes
  const publicRoutes = ['/login', '/api/auth/login']
  if (publicRoutes.includes(pathname)) {
    // Redirect if accessing /login while already logged in
    if (pathname === '/login') {
      const session = request.cookies.get('admin_session')?.value
      const isValid = await verifySession(session)

      if (isValid) {
        response = NextResponse.redirect(new URL('/', request.url))
      } else {
        response = NextResponse.next()
      }
    } else {
      response = NextResponse.next()
    }
  } else {
    // Protect /admin/* and /pwa/* routes
    if (pathname.startsWith('/admin') || pathname.startsWith('/pwa')) {
      const session = request.cookies.get('admin_session')?.value
      const isValid = await verifySession(session)

      if (!isValid) {
        response = NextResponse.redirect(new URL('/login', request.url))
      } else {
        response = NextResponse.next()
      }
    } else {
      // Allow root redirect page
      response = NextResponse.next()
    }
  }

  // Add X-Robots-Tag header to ALL responses to prevent indexing
  response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet, noimageindex, nocache')
  
  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|sw.js|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff|woff2|ttf|eot)$).*)'],
}

