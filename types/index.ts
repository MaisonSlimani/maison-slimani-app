export interface Taille {
    nom: string;
    stock: number;
}

export interface Couleur {
    nom: string;
    code?: string;
    stock?: number;
    taille?: string; // Backward compatibility
    tailles?: Taille[];
    images?: string[] | string; // Can be array of URLs or single URL string
}

export interface Product {
    id: string;
    nom: string;
    slug?: string;
    description?: string;
    prix: number;
    image_url?: string;
    image?: string; // Sometimes used as alias for image_url
    images?: string[] | { url: string }[]; // Can be array of strings or objects
    matiere?: string;
    stock: number;
    total_stock?: number;
    categorie?: string;
    categorySlug?: string;
    vedette?: boolean;
    date_ajout?: string;
    rank?: number;

    // Variations
    has_colors?: boolean;
    couleurs?: Couleur[];
    taille?: string; // Backward compatibility (comma separated string)
    tailles?: Taille[]; // New standard

    // Ratings
    average_rating?: number | null;
    rating_count?: number;
}

export interface ProductSearchParams {
    search?: string;
    categorie?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    couleur?: string[];
    taille?: string[];
    sort?: 'prix_asc' | 'prix_desc';
    limit?: number;
    offset?: number;
    useFullText?: boolean;
}

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
