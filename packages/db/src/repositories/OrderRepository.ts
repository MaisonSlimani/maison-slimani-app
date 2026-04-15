import { AppSupabaseClient } from '../client.types';
import { Order, DomainResult, CommandeProduit, OrderPlacementPayload, IOrderRepository } from '@maison/domain';
import { Database, Json } from '../database.types';

type OrderRow = Database["public"]["Tables"]["commandes"]["Row"];

interface CreateOrderRpcResult {
  success: boolean;
  data?: OrderRow;
  error?: string;
}

export class OrderRepository implements IOrderRepository {
  constructor(private supabase: AppSupabaseClient) {}

  /**
   * Maps a raw database row to a clean Domain Order model.
   */
  private mapOrder(data: OrderRow): Order {
    return {
      id: data.id,
      customerName: data.nom_client,
      phone: data.telephone,
      address: data.adresse,
      city: data.ville,
      email: data.email,
      // Map JSON produits to typed array, handling potential renames inside line items
      items: (data.produits as unknown as Array<{ id: string, name?: string, nom?: string, price?: number, prix?: number, quantity?: number, quantite?: number, image_url?: string, size?: string, taille?: string, color?: string, couleur?: string }>)?.map(item => ({
        id: item.id,
        name: item.name || item.nom,
        price: item.price || item.prix,
        quantity: item.quantity || item.quantite,
        image_url: item.image_url,
        size: item.size || item.taille,
        color: item.color || item.couleur
      })) as CommandeProduit[],
      total: data.total,
      status: data.statut as Order['status'],
      orderedAt: data.date_commande,
      // Idempotency key not currently stored in the row but used for RPC
      idempotencyKey: null,
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
   * Maps the clean Domain payload to the specific RPC arguments.
   */
  async placeOrder(payload: OrderPlacementPayload): Promise<DomainResult<Order>> {
    // Translate domain naming back to DB-naming for the RPC parameters
    const { data, error } = await this.supabase.rpc('create_order_v2_atomic', {
      p_nom_client: payload.customerName,
      p_telephone: payload.phone,
      p_adresse: payload.address,
      p_ville: payload.city,
      p_email: payload.email,
      p_produits: payload.items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image_url: item.image_url,
        size: item.size,
        color: item.color
      })) as unknown as Json,
      p_total: payload.total,
      // RPC expect non-null string
      p_idempotency_key: payload.idempotencyKey || `manual_${Date.now()}`
    });

    if (error) {
      return { success: false, error: error.message };
    }

    const rpcResult = data as unknown as CreateOrderRpcResult;

    if (rpcResult && !rpcResult.success) {
      return { success: false, error: rpcResult.error };
    }

    return { 
      success: true, 
      data: rpcResult.data ? this.mapOrder(rpcResult.data) : undefined 
    };
  }
}
