import { AppSupabaseClient } from '../client.types';
import { Database } from '../database.types';

export class StorageRepository {
  private bucket = 'produits-images';
  private supabase: AppSupabaseClient | null = null;

  constructor(supabase?: AppSupabaseClient) {
    if (supabase) {
      this.supabase = supabase;
    }
  }

  /**
   * Upload an image. Works both on server (with service key) and client (with anon key + auth).
   */
  async uploadImage(path: string, file: File | Buffer, contentType: string) {
    let client = this.supabase;

    if (!client) {
      // Fallback for server-side where service key is needed and no client was provided
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
      
      const { createClient: createServiceClient } = await import('@supabase/supabase-js');
      client = createServiceClient<Database>(supabaseUrl, supabaseServiceKey);
    }

    const { data, error } = await client.storage
      .from(this.bucket)
      .upload(path, file, { contentType, upsert: true });

    if (error) throw error;
    return data;
  }

  getPublicUrl(path: string) {
    // We can use a simple URL construction if we know the structure
    // or use the client if available
    const supabaseUrl = (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_SUPABASE_URL : null) || 
                        // @ts-expect-error - Vite env access
                        (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_SUPABASE_URL : null) ||
                        // @ts-expect-error - Vite env access
                        (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.NEXT_PUBLIC_SUPABASE_URL : null);

    return `${supabaseUrl}/storage/v1/object/public/${this.bucket}/${path}`;
  }
}
