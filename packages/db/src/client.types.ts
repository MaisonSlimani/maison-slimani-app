// client.types.ts
import { createServerClient } from '@supabase/ssr';
import { Database } from './database.types';

// Derive the type directly from what createServerClient actually returns
// so server.ts and client.ts are always structurally compatible
export type AppSupabaseClient = ReturnType<typeof createServerClient<Database>>;