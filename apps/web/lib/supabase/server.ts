import { type CookieOptions, createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@maison/db'

export async function createClient() {
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

