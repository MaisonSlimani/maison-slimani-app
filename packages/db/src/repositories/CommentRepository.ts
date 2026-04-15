import { AppSupabaseClient } from '../client.types';
import { Json } from '../database.types';
import { CommentairePayload } from '@maison/domain';

export class CommentRepository {
  constructor(private supabase: AppSupabaseClient) {}

  /**
   * Retrieves comments for a specific product.
   * Maps database fields to domain fields (commentaire -> content).
   */
  async getComments(productId: string, options: { limit: number; offset: number; sort: string }) {
    let query = this.supabase
      .from('commentaires')
      .select('id, nom, email, rating, commentaire, images, created_at, updated_at, session_token')
      .eq('produit_id', productId)
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

    const mappedData = (data || []).map(c => ({
      id: c.id,
      name: c.nom,
      email: c.email,
      rating: c.rating,
      content: c.commentaire,
      images: c.images,
      createdAt: c.created_at,
      updatedAt: c.updated_at,
      sessionToken: c.session_token
    }));

    return { data: mappedData, count };
  }

  /**
   * Persists a new comment.
   */
  async createComment(payload: CommentairePayload & { productId: string; sessionToken: string }) {
    const { data, error } = await this.supabase
      .from('commentaires')
      .insert({
        nom: payload.name,
        email: payload.email,
        rating: payload.rating,
        commentaire: payload.content,
        images: payload.images as Json,
        produit_id: payload.productId,
        session_token: payload.sessionToken,
        approved: false // Default
      })
      .select('id, nom, rating, commentaire, images, created_at')
      .single();
      
    if (error) throw error;

    return {
      id: data.id,
      name: data.nom,
      rating: data.rating,
      content: data.commentaire,
      images: data.images,
      createdAt: data.created_at
    };
  }
}
