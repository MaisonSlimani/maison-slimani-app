/**
 * Utility functions for Supabase Storage image handling
 * Images are pre-optimized at upload time to avoid Vercel Image Optimization costs
 */

/**
 * Check if an image URL is from Supabase Storage
 */
export function isSupabaseImage(url: string): boolean {
  return url?.includes('supabase.co/storage') ?? false
}

/**
 * Generate responsive sizes attribute for images
 */
export function getResponsiveSizes(defaultSizes?: string): string {
  return defaultSizes || '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
}

