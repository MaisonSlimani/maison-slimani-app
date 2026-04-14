import { NextResponse } from 'next/server';
import { createPublicClient } from '@/lib/supabase/server';
import { env } from '@/lib/utils/env';

export const dynamic = 'force-dynamic';

export async function GET() {
  const diagnostics = {
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
