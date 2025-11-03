import { cookies } from 'next/headers'
import { SignJWT, jwtVerify } from 'jose'

const secretKey = process.env.ADMIN_SESSION_SECRET || 'default-secret-change-in-production'
const encodedKey = new TextEncoder().encode(secretKey)

/**
 * Crée une session admin et la stocke dans un cookie
 */
export async function createAdminSession(email: string) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 jours

  const session = await new SignJWT({ email })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(expiresAt)
    .setIssuedAt()
    .setSubject(email)
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

/**
 * Vérifie la session admin et retourne l'email si valide
 */
export async function verifyAdminSession(): Promise<string | null> {
  const cookieStore = await cookies()
  const session = cookieStore.get('admin_session')?.value

  if (!session) {
    return null
  }

  try {
    const { payload } = await jwtVerify(session, encodedKey)
    return payload.email as string
  } catch (error) {
    return null
  }
}

/**
 * Supprime la session admin
 */
export async function deleteAdminSession() {
  const cookieStore = await cookies()
  cookieStore.delete('admin_session')
}

