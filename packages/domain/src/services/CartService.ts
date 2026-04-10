import { CartItem, DomainResult } from '../models';

export class CartService {
  /**
   * Pure logic for adding an item to a cart.
   * Returns a new array of items.
   */
  addItem(items: CartItem[], newItem: CartItem): DomainResult<CartItem[]> {
    // 1. Validation: Stock check
    if (newItem.stock !== undefined && newItem.stock !== null && newItem.stock < newItem.quantite) {
      return { 
        success: false, 
        error: `Stock insuffisant pour "${newItem.nom}". Stock disponible: ${newItem.stock}` 
      };
    }

    // 2. Add or Update
    const existingIndex = items.findIndex(i => 
      i.id === newItem.id && 
      i.couleur === newItem.couleur && 
      i.taille === newItem.taille
    );

    let updatedItems: CartItem[];
    if (existingIndex > -1) {
      const existing = items[existingIndex];
      const newTotalQuantity = existing.quantite + newItem.quantite;

      // Re-validate stock for total quantity
      if (newItem.stock !== undefined && newItem.stock !== null && newItem.stock < newTotalQuantity) {
        return { 
          success: false, 
          error: `Stock insuffisant pour "${newItem.nom}". Stock disponible: ${newItem.stock}` 
        };
      }

      updatedItems = [...items];
      updatedItems[existingIndex] = { ...existing, quantite: newTotalQuantity };
    } else {
      updatedItems = [...items, newItem];
    }

    return { success: true, data: updatedItems };
  }

  /**
   * Validation for a whole cart.
   */
  validateCart(items: CartItem[]): DomainResult<void> {
    for (const item of items) {
      if (item.stock !== undefined && item.stock !== null && item.stock < item.quantite) {
        return { success: false, error: `Le produit "${item.nom}" n'est plus en stock suffisant.` };
      }
    }
    return { success: true };
  }
}
