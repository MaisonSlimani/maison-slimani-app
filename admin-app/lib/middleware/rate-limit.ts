import { NextRequest } from 'next/server'

type RateLimitBucket = {
  count: number
  expiresAt: number
}

const rateLimitStore = new Map<string, RateLimitBucket>()

export type RateLimitResult =
  | { success: true }
  | { success: false; retryAfter: number }

export function getClientIdentifier(request: NextRequest) {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    request.headers.get('cf-connecting-ip') || // Cloudflare
    'unknown'
  )
}

export function applyRateLimit({
  key,
  limit,
  windowMs,
}: {
  key: string
  limit: number
  windowMs: number
}): RateLimitResult {
  const now = Date.now()
  const bucket = rateLimitStore.get(key)

  if (!bucket || bucket.expiresAt < now) {
    rateLimitStore.set(key, { count: 1, expiresAt: now + windowMs })
    return { success: true }
  }

  if (bucket.count >= limit) {
    const retryAfter = Math.max(1, Math.ceil((bucket.expiresAt - now) / 1000))
    return { success: false, retryAfter }
  }

  bucket.count += 1
  return { success: true }
}

