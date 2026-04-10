import { Order, DomainResult } from '../models';

export interface IOrderRepository {
  placeOrder(payload: any): Promise<DomainResult<Order>>;
}

export class OrderService {
  constructor(
    private orderRepository: IOrderRepository,
    private emailService?: any,
    private analyticsService?: any
  ) {}

  /**
   * Orchestrates the order placement process.
   * Handles validation, persistence (via RPC), and post-order side effects.
   */
  async placeOrder(payload: {
    nom_client: string;
    telephone: string;
    adresse: string;
    ville: string;
    email: string | null;
    produits: any[];
    total: number;
    idempotency_key: string;
  }): Promise<DomainResult<Order>> {
    // 1. Basic Validation
    if (payload.produits.length === 0) {
      return { success: false, error: 'Le panier est vide' };
    }

    // 2. Call Repo (which calls the Atomic RPC)
    const result = await this.orderRepository.placeOrder(payload);

    if (!result.success || !result.data) {
      return result;
    }

    // 3. Post-Order Orchestration (Non-blocking or handled by caller)
    // In our simplified Next.js context, we return the result and the API route handles emails/analytics
    // or we can pass them here via dependency injection.
    
    return result;
  }
}
