import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Utility for merging tailwind classes with clsx and tailwind-merge.
 * This is the standard pattern for high-fidelity UI styling.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Shared configuration validation logic (Zod).
 * Prevents 'blunder' of starting app without essential keys.
 */
import { z } from 'zod'

export const EnvironmentSchema = z.object({
  // Supabase URL (Require at least one format)
  SUPABASE_URL: z.string().trim().url().optional(),
  VITE_SUPABASE_URL: z.string().trim().url().optional(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().trim().url().optional(),
  
  // Supabase Anon Key
  SUPABASE_ANON_KEY: z.string().trim().min(1).optional(),
  VITE_SUPABASE_ANON_KEY: z.string().trim().min(1).optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().trim().min(1).optional(),

  // Supabase Service Role Key (Backend only)
  SUPABASE_SERVICE_ROLE_KEY: z.string().trim().min(1).optional(),

  // Resend (Emails)
  RESEND_API_KEY: z.string().trim().optional(),
  EMAIL_FROM: z.string().trim().optional(),
  RESEND_FROM_EMAIL: z.string().trim().optional(),

  // Platform
  NEXT_PUBLIC_SITE_URL: z.string().trim().url().optional(),
}).refine(data => {
  const hasUrl = data.SUPABASE_URL || data.VITE_SUPABASE_URL || data.NEXT_PUBLIC_SUPABASE_URL;
  const hasAnonKey = data.SUPABASE_ANON_KEY || data.VITE_SUPABASE_ANON_KEY || data.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return hasUrl && hasAnonKey;
}, {
  message: "Supabase URL and Anon Key are mandatory (VITE_, NEXT_PUBLIC_, or root format)"
})

export type Environment = z.infer<typeof EnvironmentSchema>

export * from './store';
export * from './logger';
export * from './init'; // Export init from here
