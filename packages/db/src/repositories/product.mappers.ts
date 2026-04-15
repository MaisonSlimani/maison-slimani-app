import { Product, ProductVariation, ProductCardDTO } from '@maison/domain';
import { Database, TablesInsert } from '../database.types';

export type ProductRow = Database["public"]["Tables"]["produits"]["Row"];

interface RawVariation {
  name?: string; nom?: string;
  code?: string;
  stock?: number; quantite?: number;
  sizes?: RawSize[]; tailles?: RawSize[];
  images?: string[];
}

interface RawSize {
  name?: string; nom?: string;
  stock?: number; quantite?: number;
}

/**
 * Maps a raw DB row to a clean domain Product model.
 * Single authoritative translation point for DB→Domain.
 */
export function mapProductRow(data: ProductRow): Product {
  return {
    id: data.id,
    name: data.name,
    description: data.description || '',
    price: data.price,
    stock: data.stock,
    totalStock: data.total_stock,
    image_url: data.image_url,
    images: (data.images as unknown as string[]) || null,
    category: data.category,
    featured: data.featured,
    hasColors: data.has_colors,
    colors: (data.colors as unknown as RawVariation[])
      ?.map(v => ({
        name: v.name || v.nom || '',
        code: v.code || '',
        stock: v.stock !== undefined ? v.stock : v.quantite || 0,
        sizes: (v.sizes || v.tailles)?.map((t: RawSize) => ({ 
          name: t.name || t.nom || '', 
          stock: t.stock !== undefined ? t.stock : t.quantite || 0 
        })) || [],
        images: v.images || [],
      })) as ProductVariation[] || null,
    sizes: (data.sizes as unknown as RawSize[])
      ?.map(t => ({ 
        name: t.name || t.nom || '', 
        stock: t.stock !== undefined ? t.stock : t.quantite || 0 
      })) || null,
    size: data.size,
    slug: data.slug,
    createdAt: data.created_at,
  };
}

/**
 * Maps a raw DB row to a lightweight ProductCardDTO.
 */
export function mapProductCardDTORow(data: ProductRow): ProductCardDTO {
  return {
    id: data.id,
    name: data.name,
    price: data.price,
    image_url: data.image_url,
    slug: data.slug,
    category: data.category,
  };
}

/**
 * Maps a domain Product model to the DB insert/update shape.
 */
export function mapProductToRow(p: Partial<Product>): TablesInsert<'produits'> {
  return {
    name: p.name!,
    description: p.description || '',
    price: p.price ?? 0,
    stock: p.stock ?? 0,
    total_stock: p.totalStock ?? p.stock ?? 0,
    image_url: p.image_url ?? null,
    images: (p.images ?? null) as unknown as TablesInsert<'produits'>['images'],
    category: p.category ?? null,
    featured: p.featured ?? false,
    has_colors: p.hasColors ?? false,
    colors: p.colors
      ? p.colors.map(v => ({
          name: v.name,
          code: v.code,
          stock: v.stock,
          sizes: v.sizes?.map(t => ({ name: t.name, stock: t.stock })),
          images: v.images,
        }))
      : null as unknown as TablesInsert<'produits'>['colors'],
    sizes: p.sizes
      ? p.sizes.map(t => ({ name: t.name, stock: t.stock }))
      : null as unknown as TablesInsert<'produits'>['sizes'],
    size: p.size ?? null,
    slug: p.slug ?? null,
    upsell_products: null,
  };
}
