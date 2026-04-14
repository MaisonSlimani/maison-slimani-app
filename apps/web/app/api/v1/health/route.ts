import { NextResponse } from 'next/server';
import { createPublicClient } from '@/lib/supabase/server';
import { env } from '@/lib/utils/env';
import { EnvironmentSchema } from '@maison/shared';

export const dynamic = 'force-dynamic';

export async function GET() {
  const validation = EnvironmentSchema.safeParse({
    SUPABASE_URL: process.env.SUPABASE_URL,
    VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  });

  const diagnostics = {
    valid: validation.success,
    errors: !validation.success ? validation.error.format() : null,
    env: {
      hasUrl: !!env.supabase.url,
      hasAnonKey: !!env.supabase.anonKey,
      urlPrefix: env.supabase.url ? env.supabase.url.substring(0, 10) : 'missing',
      nodeEnv: process.env.NODE_ENV,
    },
    supabase: {} as Record<string, unknown>,
  };

  try {
    const supabase = await createPublicClient();
    const { data, error } = await supabase.from('categories').select('id').limit(1);
    
    if (error) {
      diagnostics.supabase = { status: 'error', code: error.code, message: error.message };
    } else {
      diagnostics.supabase = { status: 'ok', count: data?.length };
    }
  } catch (err: unknown) {
    const error = err as Error;
    diagnostics.supabase = { status: 'crash', message: error.message, stack: error.stack?.split('\n')[0] };
  }

  return NextResponse.json(diagnostics);
}
