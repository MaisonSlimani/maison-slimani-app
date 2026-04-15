import { Product, ProductVariation, ProductCardDTO } from '@maison/domain';
import { Database, TablesInsert } from '../database.types';

export type ProductRow = Database["public"]["Tables"]["produits"]["Row"];

/**
 * Maps a raw DB row to a clean domain Product model.
 * Single authoritative translation point for DB→Domain.
 */
export function mapProductRow(data: ProductRow): Product {
  return {
    id: data.id,
    name: data.nom,
    description: data.description || '',
    price: data.prix,
    stock: data.stock,
    totalStock: data.total_stock,
    image_url: data.image_url,
    images: (data.images as unknown as string[]) || null,
    category: data.categorie,
    featured: data.vedette,
    hasColors: data.has_colors,
    colors: (data.couleurs as unknown as Array<{ nom: string; code: string; stock: number; tailles?: Array<{ nom: string; stock: number }>; images?: string[] }>)
      ?.map(v => ({
        name: v.nom,
        code: v.code,
        stock: v.stock,
        sizes: v.tailles?.map((t: { nom: string; stock: number }) => ({ name: t.nom, stock: t.stock })),
        images: v.images,
      })) as ProductVariation[] || null,
    sizes: (data.tailles as unknown as Array<{ nom: string; stock: number }>)
      ?.map(t => ({ name: t.nom, stock: t.stock })) || null,
    size: data.taille,
    slug: data.slug,
    createdAt: data.date_ajout,
  };
}

/**
 * Maps a raw DB row to a lightweight ProductCardDTO.
 */
export function mapProductCardDTORow(data: ProductRow): ProductCardDTO {
  return {
    id: data.id,
    name: data.nom,
    price: data.prix,
    image_url: data.image_url,
    slug: data.slug,
    category: data.categorie,
  };
}

/**
 * Maps a domain Product model to the DB insert/update shape.
 * This is the ONLY place in the codebase that knows about DB column names.
 */
export function mapProductToRow(p: Partial<Product>): TablesInsert<'produits'> {
  return {
    nom: p.name!,
    description: p.description || '',
    prix: p.price ?? 0,
    stock: p.stock ?? 0,
    total_stock: p.totalStock ?? p.stock ?? 0,
    image_url: p.image_url ?? null,
    images: (p.images ?? null) as unknown as TablesInsert<'produits'>['images'],
    categorie: p.category ?? null,
    vedette: p.featured ?? false,
    has_colors: p.hasColors ?? false,
    couleurs: p.colors
      ? p.colors.map(v => ({
          nom: v.name,
          code: v.code,
          stock: v.stock,
          tailles: v.sizes?.map(t => ({ nom: t.name, stock: t.stock })),
          images: v.images,
        }))
      : null as unknown as TablesInsert<'produits'>['couleurs'],
    tailles: p.sizes
      ? p.sizes.map(t => ({ nom: t.name, stock: t.stock }))
      : null as unknown as TablesInsert<'produits'>['tailles'],
    taille: p.size ?? null,
    slug: p.slug ?? null,
    upsell_products: null,
  };
}
