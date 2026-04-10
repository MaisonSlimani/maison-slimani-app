import { SupabaseClient } from '@supabase/supabase-js';
import { Order, DomainResult, CommandeProduit } from '@maison/domain';
import { Database } from '../database.types';

export class OrderRepository {
  private supabase: SupabaseClient<Database>;
  constructor(supabase: SupabaseClient<Database>) {
    this.supabase = supabase;
  }

  private mapOrder(data: Database["public"]["Tables"]["commandes"]["Row"]): Order {
    return {
      ...data,
      // Map JSON produits to typed array
      produits: data.produits as unknown as CommandeProduit[],
      // Status string cast to union (handled in Domain)
      statut: data.statut as Order['statut'],
    };
  }

  async findAll(status?: string): Promise<Order[]> {
    let query = this.supabase
      .from('commandes')
      .select('*')
      .order('date_commande', { ascending: false });

    if (status && status !== 'tous' && status !== 'all') {
      query = query.eq('statut', status);
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data || []).map(d => this.mapOrder(d));
  }

  async updateStatus(id: string, status: string): Promise<DomainResult<Order>> {
    const { data, error } = await this.supabase
      .from('commandes')
      .update({ statut: status })
      .eq('id', id)
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data ? this.mapOrder(data) : undefined };
  }

  async delete(id: string): Promise<DomainResult<void>> {
    const { error } = await this.supabase
      .from('commandes')
      .delete()
      .eq('id', id);

    if (error) return { success: false, error: error.message };
    return { success: true };
  }

  async findById(id: string): Promise<Order | null> {
    const { data, error } = await this.supabase
      .from('commandes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data ? this.mapOrder(data) : null;
  }

  /**
   * Atomic Order Placement via Postgres RPC.
   * Consolidates stock decrement and order insertion in one transaction.
   */
  async placeOrder(payload: {
    nom_client: string;
    telephone: string;
    adresse: string;
    ville: string;
    email: string | null;
    produits: CommandeProduit[];
    total: number;
    idempotency_key: string;
  }): Promise<DomainResult<Order>> {
    // Note: RPC arguments must match the Postgres function signature exactly
    const { data, error } = await this.supabase.rpc('create_order_v2_atomic', {
      p_nom_client: payload.nom_client,
      p_telephone: payload.telephone,
      p_adresse: payload.adresse,
      p_ville: payload.ville,
      p_email: payload.email,
      p_produits: payload.produits as any, // Cast to any for the RPC wire call (Json)
      p_total: payload.total,
      p_idempotency_key: payload.idempotency_key
    });

    if (error) {
      return { success: false, error: error.message };
    }

    // data here is the return of the RPC function: { success: boolean, data?: any, error?: string }
    const rpcResult = data as any;

    if (rpcResult && !rpcResult.success) {
      return { success: false, error: rpcResult.error };
    }

    return { 
      success: true, 
      data: rpcResult.data ? this.mapOrder(rpcResult.data) : undefined 
    };
  }
}
