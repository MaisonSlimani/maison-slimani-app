import { cookies } from 'next/headers'
import { SignJWT, jwtVerify } from 'jose'

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

export async function createAdminSession(email: string) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  const session = await new SignJWT({ email })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(expiresAt)
    .setIssuedAt()
    .setSubject(email)
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .sign(encodedKey)

  const cookieStore = await cookies()
  cookieStore.set('admin_session', session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
  })
}

export async function verifyAdminSession(): Promise<string | null> {
  const cookieStore = await cookies()
  const session = cookieStore.get('admin_session')?.value

  if (!session) {
    return null
  }

  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    })
    return payload.email as string
  } catch (error) {
    return null
  }
}

export async function deleteAdminSession() {
  const cookieStore = await cookies()
  cookieStore.delete('admin_session')
}

