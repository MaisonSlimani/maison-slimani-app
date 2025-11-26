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

  // Protect admin routes (except login)
  if (pathname !== '/login' && pathname !== '/api/auth/login') {
    const session = request.cookies.get('admin_session')?.value
    const isValid = await verifySession(session)

    if (!isValid) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Redirect if accessing /login while already logged in
  if (pathname === '/login') {
    const session = request.cookies.get('admin_session')?.value
    const isValid = await verifySession(session)

    if (isValid) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|sw.js|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff|woff2|ttf|eot)$).*)'],
}

