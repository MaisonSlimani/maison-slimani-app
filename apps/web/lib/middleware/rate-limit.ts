import { NextRequest } from 'next/server'
import { createAdminClient } from '../supabase/server'

/**
 * RATE LIMITING STRATEGY (NEXT.JS 15 / VERCEL)
 * 
 * In serverless environments, in-memory Map is NOT reliable because each cold start 
 * resets the counter and traffic might be spread across multiple isolates.
 * 
 * Persistent rate limiting via DB (Supabase) is used for critical endpoints (contact, login).
 * For mutation endpoints (orders), the REAL protection is the IDEMPOTENCY KEY.
 */

type RateLimitBucket = {
  count: number
  expiresAt: number
}

// Memory fallback (still useful for high-freq spikes within a single isolate)
const localRateLimitStore = new Map<string, RateLimitBucket>()

export type RateLimitResult =
  | { success: true }
  | { success: false; retryAfter: number }

export function getClientIdentifier(request: NextRequest) {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    request.headers.get('cf-connecting-ip') || 
    'unknown'
  )
}

/**
 * Applies a persistent rate limit using Supabase.
 * Bypasses RLS using the admin client.
 */
export async function applyRateLimit({
  key,
  limit,
  windowMs,
}: {
  key: string
  limit: number
  windowMs: number
}): Promise<RateLimitResult> {
  const now = Date.now()
  const expiresAt = now + windowMs

  try {
    const supabase = await createAdminClient()
    
    // 1. Clean up expired entries occasionally or just for this key
    // In a high-traffic app, we might do this via a cron job instead.
    
    // 2. Atomic increment/upsert using an RPC or a clever transaction.
    // Since we want to avoid multiple roundtrips, we'll try a single call.
    
    // For simplicity and to avoid creating a new RPC right now, we use a single query approach:
    const { data: bucket, error: fetchError } = await supabase
      .from('rate_limits')
      .select('count, expires_at')
      .eq('key', key)
      .maybeSingle()

    if (fetchError) throw fetchError

    if (!bucket || bucket.expires_at < now) {
      // Create new bucket (or overwrite expired one)
      const { error: upsertError } = await supabase
        .from('rate_limits')
        .upsert({ 
          key, 
          count: 1, 
          expires_at: expiresAt,
          last_updated: new Date().toISOString()
        })
      
      if (upsertError) throw upsertError
      return { success: true }
    }

    if (bucket.count >= limit) {
      const retryAfter = Math.max(1, Math.ceil(((bucket.expires_at as number) - now) / 1000))
      return { success: false, retryAfter }
    }

    // Increment count
    const { error: updateError } = await supabase
      .from('rate_limits')
      .update({ 
        count: bucket.count + 1,
        last_updated: new Date().toISOString()
      })
      .eq('key', key)

    if (updateError) throw updateError
    return { success: true }

  } catch (error) {
    console.error('Rate Limit DB Error, falling back to in-memory:', error)
    return applyLocalRateLimit({ key, limit, windowMs })
  }
}

/**
 * In-memory fallback for rate limiting.
 */
function applyLocalRateLimit({
  key,
  limit,
  windowMs,
}: {
  key: string
  limit: number
  windowMs: number
}): RateLimitResult {
  const now = Date.now()
  const bucket = localRateLimitStore.get(key)

  if (!bucket || bucket.expiresAt < now) {
    localRateLimitStore.set(key, { count: 1, expiresAt: now + windowMs })
    return { success: true }
  }

  if (bucket.count >= limit) {
    const retryAfter = Math.max(1, Math.ceil((bucket.expiresAt - now) / 1000))
    return { success: false, retryAfter }
  }

  bucket.count += 1
  return { success: true }
}

