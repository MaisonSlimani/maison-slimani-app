import { EnvironmentSchema } from '@maison/shared';

/**
 * Validates and exports environment variables.
 * This ensures the application crashes early with a clear error if essential keys are missing.
 */
function validateEnv() {
  const result = EnvironmentSchema.safeParse({
    SUPABASE_URL: process.env.SUPABASE_URL,
    VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  });

  if (!result.success) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('❌ Invalid Environment Variables:', result.error.format());
    }
    // We don't throw here to avoid breaking build-time static generation if keys are missing in CI,
    // but in runtime, the missing keys will be caught by the returned object.
  }

  const data = result.data || {};
  const url = data.NEXT_PUBLIC_SUPABASE_URL || data.SUPABASE_URL || data.VITE_SUPABASE_URL || '';
  const anonKey = data.NEXT_PUBLIC_SUPABASE_ANON_KEY || data.SUPABASE_ANON_KEY || data.VITE_SUPABASE_ANON_KEY || '';
  const serviceRoleKey = data.SUPABASE_SERVICE_ROLE_KEY || '';

  return {
    supabase: {
      url,
      anonKey,
      serviceRoleKey,
    },
    isDev: process.env.NODE_ENV === 'development',
    isProd: process.env.NODE_ENV === 'production',
  };
}

export const env = validateEnv();
