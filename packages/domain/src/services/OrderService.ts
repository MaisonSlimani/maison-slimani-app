import { Order, DomainResult, OrderPlacementPayload } from '../models';
import { IOrderRepository } from '../repositories/IOrderRepository';

export class OrderService {
  constructor(
    private orderRepository: IOrderRepository,
  ) { }

  /**
   * Orchestrates the order placement process.
   * Handles validation, persistence (via RPC), and post-order side effects.
   */
  async placeOrder(payload: OrderPlacementPayload): Promise<DomainResult<Order>> {
    // 1. Domain Invariants & business rule validation
    if (!payload.customerName?.trim()) {
      return { success: false, error: 'Le nom du client est requis' };
    }

    if (!payload.address?.trim()) {
      return { success: false, error: 'L\'adresse est requise' };
    }

    if (payload.items.length === 0) {
      return { success: false, error: 'Le panier est vide' };
    }

    if (payload.total <= 0) {
      return { success: false, error: 'Le montant total est invalide' };
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
