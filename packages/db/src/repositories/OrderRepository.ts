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
      customerName: data.customer_name,
      phone: data.phone,
      address: data.address,
      city: data.city,
      email: data.email,
      items: (data.items as unknown as Array<{ id: string, name?: string, price?: number, quantity?: number, image_url?: string, size?: string, color?: string }>)?.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image_url: item.image_url,
        size: item.size,
        color: item.color
      })) as CommandeProduit[],
      total: data.total,
      status: data.status as Order['status'],
      orderedAt: data.created_at,
      idempotencyKey: null,
    };
  }

  async findAll(status?: string): Promise<Order[]> {
    let query = this.supabase
      .from('commandes')
      .select('*')
      .order('created_at', { ascending: false });

    if (status && status !== 'tous' && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data || []).map(d => this.mapOrder(d));
  }

  async updateStatus(id: string, status: string): Promise<DomainResult<Order>> {
    const { data, error } = await this.supabase
      .from('commandes')
      .update({ status: status })
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
   */
  async placeOrder(payload: OrderPlacementPayload): Promise<DomainResult<Order>> {
    const { data, error } = await this.supabase.rpc('create_order_v2_atomic', {
      p_customer_name: payload.customerName,
      p_phone: payload.phone,
      p_address: payload.address,
      p_city: payload.city,
      p_email: payload.email,
      p_items: payload.items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image_url: item.image_url,
        size: item.size,
        color: item.color
      })) as unknown as Json,
      p_total: payload.total,
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
