import { Order, DomainResult, OrderPlacementPayload } from '../models';

/**
 * Domain-level contract for Order Persistence.
 * Infrastructure layers must implement this interface.
 */
export interface IOrderRepository {
  /**
   * Places a new order atomically.
   */
  placeOrder(payload: OrderPlacementPayload): Promise<DomainResult<Order>>;

  /**
   * Retrieves all orders, optionally filtered by status.
   */
  findAll(status?: string): Promise<Order[]>;

  /**
   * Retrieves a single order by ID.
   */
  findById(id: string): Promise<Order | null>;

  /**
   * Updates the status of an existing order.
   */
  updateStatus(id: string, status: string): Promise<DomainResult<Order>>;

  /**
   * Deletes an order by ID.
   */
  delete(id: string): Promise<DomainResult<void>>;
}
