import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

// Validate that ADMIN_SESSION_SECRET is set and has minimum length
const secretKey = process.env.ADMIN_SESSION_SECRET
if (!secretKey || secretKey.length < 32) {
  throw new Error(
    'ADMIN_SESSION_SECRET environment variable is required and must be at least 32 characters long. ' +
    'Please set it in your .env.local or environment variables.'
  )
}
const encodedKey = new TextEncoder().encode(secretKey)

// JWT issuer and audience for additional security
const JWT_ISSUER = 'maison-slimani-admin'
const JWT_AUDIENCE = 'maison-slimani-admin-app'

async function verifySession(session: string | undefined): Promise<boolean> {
  if (!session) return false

  try {
    await jwtVerify(session, encodedKey, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    })
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

