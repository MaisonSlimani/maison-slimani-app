/**
 * Session token management for comment ownership
 * Allows users to edit/delete their own comments without requiring accounts
 */

import { cookies } from 'next/headers'
import { randomUUID } from 'crypto'

const SESSION_TOKEN_COOKIE_NAME = 'comment_session_token'
const SESSION_TOKEN_EXPIRY_DAYS = 7

/**
 * Generate a new session token
 */
export function generateSessionToken(): string {
  return randomUUID()
}

/**
 * Get session token from cookies
 */
export async function getSessionToken(): Promise<string | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(SESSION_TOKEN_COOKIE_NAME)
    return token?.value || null
  } catch {
    return null
  }
}

/**
 * Set session token in cookie
 */
export async function setSessionToken(token: string): Promise<void> {
  try {
    const cookieStore = await cookies()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + SESSION_TOKEN_EXPIRY_DAYS)
    
    cookieStore.set(SESSION_TOKEN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt,
      path: '/',
    })
  } catch (error) {
    // Cookie setting might fail in some contexts (e.g., middleware)
    // This is handled gracefully
    console.warn('Failed to set session token cookie:', error)
  }
}

/**
 * Validate session token matches the one stored with comment
 */
export async function validateSessionToken(commentToken: string): Promise<boolean> {
  const userToken = await getSessionToken()
  return userToken === commentToken
}

