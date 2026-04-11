import { AppSupabaseClient } from '../client.types';
import { Json } from '../database.types';
import { CommentairePayload } from '@maison/domain';

export class CommentRepository {
  constructor(private supabase: AppSupabaseClient) {}

  async getComments(produitId: string, options: { limit: number; offset: number; sort: string }) {
    let query = this.supabase
      .from('commentaires')
      .select('id, nom, email, rating, commentaire, images, created_at, updated_at, session_token')
      .eq('produit_id', produitId)
      .eq('approved', true)
      .range(options.offset, options.offset + options.limit - 1);

    if (options.sort === 'highest') {
      query = query.order('rating', { ascending: false });
    } else if (options.sort === 'lowest') {
      query = query.order('rating', { ascending: true });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data, error, count } = await query;
    if (error) throw error;
    return { data, count };
  }

  async createComment(payload: CommentairePayload & { produit_id: string; session_token: string }) {
    const { data, error } = await this.supabase
      .from('commentaires')
      .insert({
        nom: payload.nom,
        email: payload.email,
        rating: payload.rating,
        commentaire: payload.commentaire,
        images: payload.images as Json,
        produit_id: payload.produit_id,
        session_token: payload.session_token,
        approved: false // Default
      })
      .select('id, nom, rating, commentaire, images, created_at')
      .single();
      
    if (error) throw error;
    return data;
  }
}
