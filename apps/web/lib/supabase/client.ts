import { createBrowserClient } from '@supabase/ssr'
import { env } from '../utils/env'

/**
 * Creates a typed Supabase client for use in browser environments.
 * Uses validated environment variables.
 */
export function createClient() {
  return createBrowserClient(
    env.supabase.url,
    env.supabase.anonKey
  )
}
