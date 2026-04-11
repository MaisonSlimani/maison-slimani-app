import test from 'node:test';
import assert from 'node:assert/strict';
import { DashboardService } from '../../src/services/DashboardService';
import { Order, Product } from '../../src/models';

test('DashboardService - calculateMetrics with empty data', () => {
  const service = new DashboardService();
  const metrics = service.calculateMetrics([], []);

  assert.strictEqual(metrics.totalCommandes, 0);
  assert.strictEqual(metrics.totalRevenus, 0);
  assert.strictEqual(metrics.commandesEnAttente, 0);
  assert.strictEqual(metrics.totalStock, 0);
  assert.strictEqual(metrics.produitsRupture, 0);
});

test('DashboardService - calculates revenue and orders correctly', () => {
  const service = new DashboardService();
  const orders: Partial<Order>[] = [
    { total: 100, statut: 'Livré' },
    { total: 50, statut: 'En attente' },
    { total: 200, statut: 'Annulé' }, // Cancelled orders still count toward total revenue in this logic but maybe shouldn't? Current logic says yes.
    { total: 0, statut: 'En attente' }
  ];

  const metrics = service.calculateMetrics(orders as Order[], []);

  assert.strictEqual(metrics.totalCommandes, 4);
  assert.strictEqual(metrics.totalRevenus, 350);
  assert.strictEqual(metrics.commandesEnAttente, 2);
});

test('DashboardService - calculates stock metrics correctly', () => {
  const service = new DashboardService();
  const products: Partial<Product>[] = [
    { total_stock: 10 },
    { total_stock: 0 },
    { total_stock: -5 }, // Exceptional case but should be handled
    { total_stock: 100 }
  ];

  const metrics = service.calculateMetrics([], products as Product[]);

  assert.strictEqual(metrics.totalStock, 105);
  assert.strictEqual(metrics.produitsRupture, 2); // 0 and -5
});

test('DashboardService - handles null/undefined values gracefully', () => {
  const service = new DashboardService();
  const orders: any[] = [
    { total: null, statut: 'En attente' },
    { total: 100, statut: 'En attente' }
  ];
  const products: any[] = [
    { total_stock: undefined },
    { total_stock: 50 }
  ];

  const metrics = service.calculateMetrics(orders as Order[], products as Product[]);

  assert.strictEqual(metrics.totalRevenus, 100);
  assert.strictEqual(metrics.totalStock, 50);
  assert.strictEqual(metrics.produitsRupture, 1); // undefined count as 0
});
