import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js'
import { Database } from '../database.types'

let supabaseInstance: SupabaseClient<Database> | null = null

/**
 * Smart configuration getter that handles both Next.js and Vite environments.
 */
export const getSupabaseConfig = () => {
  // Try Vite prefixes first, then Next.js
  // Vite strictly requires the exact string 'import.meta.env.VITE_xxx' to be present for static replacement.
  // @ts-expect-error - Vite env access
  const viteUrl = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_SUPABASE_URL : null;
  // @ts-expect-error - Vite env access
  const viteAnonKey = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_SUPABASE_ANON_KEY : null;

  const url = (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_SUPABASE_URL : null) || viteUrl
  const anonKey = (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY : null) || viteAnonKey

  if (!url || !anonKey) {
    throw new Error('Supabase environment variables are missing (checked VITE_ and NEXT_PUBLIC_ prefixes).')
  }

  return { url, anonKey }
}

/**
 * Singleton Supabase Client for the browser/client-side.
 */
export const createClient = (): SupabaseClient<Database> => {
  if (supabaseInstance) return supabaseInstance

  const { url, anonKey } = getSupabaseConfig()
  supabaseInstance = createSupabaseClient<Database>(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  })
  
  return supabaseInstance
}
