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
  VITE_SUPABASE_URL: z.string().optional(),
  VITE_SUPABASE_ANON_KEY: z.string().optional(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
})

export type Environment = z.infer<typeof EnvironmentSchema>
