import { Product, ProductVariation } from '../models';

/**
 * Domain functions for Product-related business logic.
 * Decoupled from any framework or infrastructure.
 */

/**
 * Resolves the specific stock for a selected variation (color/size).
 */
export function getSelectedStock(produit: Product, color?: string | null, size?: string | null): number | null {
  const variations = produit.colors as ProductVariation[] | null;
  let selectedStock = produit.stock;

  if (produit.hasColors && variations && color) {
    const variation = variations.find((v: ProductVariation) => v.name === color);
    if (variation) {
      if (size && variation.sizes) {
        selectedStock = variation.sizes.find((s) => s.name === size)?.stock ?? 0;
      } else if (variation.stock !== undefined) {
        selectedStock = variation.stock;
      }
    }
  }
  
  return selectedStock;
}

/**
 * Validates if the required selections (color/size) are made.
 */
export function validateProductSelections(produit: Product, color?: string | null, size?: string | null): string | null {
  if (produit.hasColors && !color) return 'Veuillez sélectionner une couleur';
  
  const variations = produit.colors as ProductVariation[] | null;
  const hasSizes = (produit.hasColors && color && variations?.find(v => v.name === color)?.sizes?.length) || (produit.sizes?.length);
  
  if (hasSizes && !size) return 'Veuillez sélectionner une taille';
  
  return null;
}

