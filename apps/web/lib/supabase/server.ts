import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { AppSupabaseClient, Database } from '@maison/db'
import { env } from '../utils/env'

/**
 * Creates a typed Supabase client for use in server-side logic with cookie handling.
 */
export async function createClient(): Promise<AppSupabaseClient> {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    env.supabase.url,
    env.supabase.anonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The context of cookies is not available in some routes (e.g. middleware)
          }
        },
      },
    }
  )
}

/**
 * Creates a Supabase client for public data fetching.
 * Does NOT use cookies, making it safe for unstable_cache and static generation.
 */
export async function createPublicClient(): Promise<AppSupabaseClient> {
  return createServerClient<Database>(
    env.supabase.url,
    env.supabase.anonKey,
    {
      cookies: {
        getAll() { return [] },
        setAll() { /* No-op for public client */ },
      },
    }
  )
}

/**
 * Creates a Supabase client for administrative data fetching.
 * Uses the service role key to bypass RLS.
 * WARNING: Use sparingly and only for internal/server-side operations.
 */
export async function createAdminClient(): Promise<AppSupabaseClient> {
  if (!env.supabase.serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for admin client.')
  }

  return createServerClient<Database>(
    env.supabase.url,
    env.supabase.serviceRoleKey,
    {
      cookies: {
        getAll() { return [] },
        setAll() { /* No-op for admin client */ },
      },
    }
  )
}
