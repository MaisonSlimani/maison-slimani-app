import { Product, ProductVariation } from '../models';

/**
 * Domain Service for Product-related business logic.
 * Decoupled from any framework or infrastructure.
 */
export class ProductService {
  /**
   * Resolves the specific stock for a selected variation (color/size).
   */
  public getSelectedStock(produit: Product, couleur?: string | null, taille?: string | null): number | null {
    const variations = produit.couleurs as ProductVariation[] | null;
    let selectedStock = produit.stock;

    if (produit.has_colors && variations && couleur) {
      const variation = variations.find((v: ProductVariation) => v.nom === couleur);
      if (variation) {
        if (taille && variation.tailles) {
          selectedStock = (variation.tailles as { nom: string; stock: number }[]).find((t) => t.nom === taille)?.stock ?? 0;
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
  public validateSelections(produit: Product, couleur?: string | null, taille?: string | null): string | null {
    if (produit.has_colors && !couleur) return 'Veuillez sélectionner une couleur';
    
    const variations = produit.couleurs as ProductVariation[] | null;
    const hasSizes = (produit.has_colors && couleur && variations?.find(v => v.nom === couleur)?.tailles?.length) || (produit.tailles?.length);
    
    if (hasSizes && !taille) return 'Veuillez sélectionner une taille';
    
    return null;
  }
}
