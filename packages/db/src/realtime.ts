import { ProductVariation } from '@maison/domain';
import { RealtimePostgresUpdatePayload } from '@supabase/supabase-js';
import { createClient } from './supabase';

export type StockUpdateCallback = (data: { 
  id: string; 
  stock: number | null; 
  colors: ProductVariation[] | null;
  hasColors: boolean | null;
}) => void;

/**
 * Decoupled utility for realtime stock updates.
 * Centralizes Supabase channel logic to keep UI/Hooks clean.
 */
export const subscribeToStockUpdate = (productId: string, onUpdate: StockUpdateCallback) => {
  const supabase = createClient();
  
  const channelName = `stock-watch-${productId}-${Math.random().toString(36).substring(7)}`;
  
  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'produits', 
        filter: `id=eq.${productId}` 
      },
      (payload: RealtimePostgresUpdatePayload<{ 
        id: string; 
        stock: number | null; 
        colors: ProductVariation[] | null; 
        hasColors: boolean | null; 
      }>) => {
        onUpdate(payload.new);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

/**
 * Bulk subscription for multiple products (e.g., for the cart).
 */
export const subscribeToBulkStockUpdates = (productIds: string[], onUpdate: StockUpdateCallback) => {
  if (productIds.length === 0) return () => {};
  
  const supabase = createClient();
  const channelName = `bulk-stock-watch-${Math.random().toString(36).substring(7)}`;
  
  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'produits', 
        filter: `id=in.(${productIds.join(',')})` 
      },
      (payload: RealtimePostgresUpdatePayload<{ 
        id: string; 
        stock: number | null; 
        colors: ProductVariation[] | null; 
        hasColors: boolean | null; 
      }>) => {
        onUpdate(payload.new);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};
