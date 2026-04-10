import { Order, Product } from '../models';

export interface IDashboardMetrics {
  totalCommandes: number;
  totalRevenus: number;
  commandesEnAttente: number;
  totalStock: number;
  produitsRupture: number;
}

export class DashboardService {
  /**
   * Pure logic for calculating dashboard metrics from domain objects.
   * This is shared across any UI that needs admin-level insights.
   */
  calculateMetrics(commandes: Order[], produits: Product[]): IDashboardMetrics {
    const totalRevenus = commandes.reduce((acc, curr) => acc + (curr.total || 0), 0);
    const enAttente = commandes.filter(c => c.statut === 'En attente').length;
    
    const totalStock = produits.reduce((acc, curr) => acc + (curr.total_stock || 0), 0);
    const produitsRupture = produits.filter(p => (p.total_stock || 0) <= 0).length;

    return {
      totalCommandes: commandes.length,
      totalRevenus,
      commandesEnAttente: enAttente,
      totalStock,
      produitsRupture
    };
  }
}
