import { SiteSettings as DomainSiteSettings } from '@maison/domain'

export interface FilterState {
  minPrice?: number
  maxPrice?: number
  size?: string[]
  inStock?: boolean
  color?: string[]
  category?: string[]
}

export interface Taille {
    name: string; // Was 'nom'
    stock: number;
}

export interface Couleur {
    name: string; // Was 'nom'
    code?: string;
    stock?: number;
    sizes?: Taille[]; // Was 'tailles'
    images?: string[] | string;
}

export interface Product {
    id: string;
    name: string; // Was 'nom'
    slug?: string;
    description?: string;
    price: number; // Was 'prix'
    image_url?: string;
    image?: string; 
    images?: string[] | { url: string }[]; 
    material?: string; // Was 'matiere'
    stock: number;
    totalStock?: number; // Was 'total_stock'
    category?: string; // Was 'categorie'
    categorySlug?: string;
    featured?: boolean; // Was 'vedette'
    createdAt?: string; // Was 'date_ajout'
    rank?: number;

    // Variations
    hasColors?: boolean; // Was 'has_colors'
    colors?: Couleur[]; // Was 'couleurs'
    size?: string; 
    sizes?: Taille[]; 

    // Ratings
    averageRating?: number | null; // Was 'average_rating'
    ratingCount?: number; // Was 'rating_count'
}

export interface ProductSearchParams {
    search?: string;
    category?: string; // Was 'categorie'
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    color?: string[]; // Was 'couleur'
    size?: string[]; // Was 'taille'
    sort?: 'price_asc' | 'price_desc' | 'price-asc' | 'price-desc' | 'prix_asc' | 'prix_desc';
    limit?: number;
    offset?: number;
    useFullText?: boolean;
}

export interface FAQItem {
    question: string;
    answer: string;
}

export interface Commentaire {
  id: string;
  productId: string; // Was 'produit_id'
  name: string; // Was 'nom'
  email?: string;
  rating: number;
  content: string; // Was 'commentaire'
  images: string[];
  approved?: boolean;
  flagged?: boolean;
  canEdit?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export type SiteSettings = DomainSiteSettings

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    metadata?: {
        total?: number;
        count?: number;
        page?: number;
        totalPages?: number;
    };
}
