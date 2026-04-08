import { createBrowserClient, createServerClient } from '@supabase/ssr';

export const getSupabaseConfig = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error('Supabase environment variables are missing.');
  }

  return { url, anonKey };
};

export const createBaseBrowserClient = () => {
  const { url, anonKey } = getSupabaseConfig();
  return createBrowserClient(url, anonKey);
};

export const createBaseServerClient = (cookieStore: any) => {
  const { url, anonKey } = getSupabaseConfig();
  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Normal in some middleware/server component contexts
        }
      },
    },
  });
};
