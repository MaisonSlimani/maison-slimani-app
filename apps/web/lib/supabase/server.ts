import { type CookieOptions, createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { AppSupabaseClient, Database } from '@maison/db'

export async function createClient(): Promise<AppSupabaseClient> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    const missingVars: string[] = []
    if (!supabaseUrl) missingVars.push('NEXT_PUBLIC_SUPABASE_URL')
    if (!supabaseAnonKey) missingVars.push('NEXT_PUBLIC_SUPABASE_ANON_KEY')

    throw new Error(
      `Variables d'environnement Supabase manquantes: ${missingVars.join(', ')}. ` +
      'Assurez-vous que ces variables sont définies dans votre fichier .env.local ou dans les variables d\'environnement Vercel.'
    )
  }

  // Validate URL format
  try {
    new URL(supabaseUrl)
  } catch {
    throw new Error(
      `URL Supabase invalide: ${supabaseUrl}. ` +
      'Vérifiez que NEXT_PUBLIC_SUPABASE_URL est une URL valide.'
    )
  }

  let cookieStore: Awaited<ReturnType<typeof cookies>> & {
    set(name: string, value: string, options: CookieOptions): void;
  }

  try {
    cookieStore = await cookies() as Awaited<ReturnType<typeof cookies>> & {
      set(name: string, value: string, options: CookieOptions): void;
    }
  } catch (error) {
    throw new Error(
      'Impossible d\'accéder au contexte de cookies.',
      { cause: error }
    )
  }

  return createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Le contexte de cookies n'est pas disponible dans certaines routes
            // C'est normal dans certains cas (ex: middleware)
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
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Variables Supabase manquantes pour le client public.')
  }

  return createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
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
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Variables Supabase (URL ou Service Role Key) manquantes pour le client admin.')
  }

  return createServerClient<Database>(
    supabaseUrl,
    serviceRoleKey,
    {
      cookies: {
        getAll() { return [] },
        setAll() { /* No-op for admin client */ },
      },
    }
  )
}
