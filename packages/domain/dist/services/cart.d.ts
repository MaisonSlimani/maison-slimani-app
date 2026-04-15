import { CartItem, DomainResult } from '../models';
/**
 * Pure domain logic for cart calculations and validations.
 * No dependencies on React, window, or localStorage.
 */
export declare const calculateTotal: (items: CartItem[]) => number;
export declare const validateQuantityUpdate: (item: CartItem, newQuantity: number) => DomainResult<number>;
export declare const validateAddToCart: (item: CartItem, currentItems: CartItem[]) => DomainResult<CartItem>;
//# sourceMappingURL=cart.d.ts.map