import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

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

  // Protect admin routes
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

  // Redirect to admin if already logged in and accessing /login
  if (pathname === '/login') {
    const session = request.cookies.get('admin_session')?.value
    const isValid = await verifySession(session)

    if (isValid) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/login'],
}
