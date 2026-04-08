import { z } from 'zod';
export declare const produitQuerySchema: z.ZodObject<{
    categorie: z.ZodEffects<z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>, string[] | undefined, string | string[] | undefined>;
    vedette: z.ZodOptional<z.ZodEffects<z.ZodString, boolean, string>>;
    search: z.ZodOptional<z.ZodString>;
    limit: z.ZodOptional<z.ZodPipeline<z.ZodEffects<z.ZodString, number, string>, z.ZodNumber>>;
    offset: z.ZodOptional<z.ZodPipeline<z.ZodEffects<z.ZodString, number, string>, z.ZodNumber>>;
    sort: z.ZodOptional<z.ZodEnum<["prix_asc", "prix_desc", "prix-asc", "prix-desc"]>>;
    useFullText: z.ZodOptional<z.ZodEffects<z.ZodString, boolean, string>>;
    minPrice: z.ZodOptional<z.ZodPipeline<z.ZodEffects<z.ZodString, number, string>, z.ZodNumber>>;
    maxPrice: z.ZodOptional<z.ZodPipeline<z.ZodEffects<z.ZodString, number, string>, z.ZodNumber>>;
    taille: z.ZodEffects<z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>, string[] | undefined, string | string[] | undefined>;
    inStock: z.ZodOptional<z.ZodEffects<z.ZodString, boolean, string>>;
    couleur: z.ZodEffects<z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>, string[] | undefined, string | string[] | undefined>;
}, "strip", z.ZodTypeAny, {
    sort?: "prix_asc" | "prix_desc" | "prix-asc" | "prix-desc" | undefined;
    categorie?: string[] | undefined;
    vedette?: boolean | undefined;
    search?: string | undefined;
    limit?: number | undefined;
    offset?: number | undefined;
    useFullText?: boolean | undefined;
    minPrice?: number | undefined;
    maxPrice?: number | undefined;
    taille?: string[] | undefined;
    inStock?: boolean | undefined;
    couleur?: string[] | undefined;
}, {
    sort?: "prix_asc" | "prix_desc" | "prix-asc" | "prix-desc" | undefined;
    categorie?: string | string[] | undefined;
    vedette?: string | undefined;
    search?: string | undefined;
    limit?: string | undefined;
    offset?: string | undefined;
    useFullText?: string | undefined;
    minPrice?: string | undefined;
    maxPrice?: string | undefined;
    taille?: string | string[] | undefined;
    inStock?: string | undefined;
    couleur?: string | string[] | undefined;
}>;
export declare const commandeProduitSchema: z.ZodObject<{
    id: z.ZodString;
    nom: z.ZodString;
    prix: z.ZodNumber;
    quantite: z.ZodNumber;
    image_url: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    taille: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    couleur: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    nom: string;
    prix: number;
    quantite: number;
    taille?: string | null | undefined;
    couleur?: string | null | undefined;
    image_url?: string | null | undefined;
}, {
    id: string;
    nom: string;
    prix: number;
    quantite: number;
    taille?: string | null | undefined;
    couleur?: string | null | undefined;
    image_url?: string | null | undefined;
}>;
export declare const commandeSchema: z.ZodObject<{
    nom_client: z.ZodString;
    telephone: z.ZodString;
    email: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    adresse: z.ZodString;
    ville: z.ZodString;
    produits: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        nom: z.ZodString;
        prix: z.ZodNumber;
        quantite: z.ZodNumber;
        image_url: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        taille: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        couleur: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        nom: string;
        prix: number;
        quantite: number;
        taille?: string | null | undefined;
        couleur?: string | null | undefined;
        image_url?: string | null | undefined;
    }, {
        id: string;
        nom: string;
        prix: number;
        quantite: number;
        taille?: string | null | undefined;
        couleur?: string | null | undefined;
        image_url?: string | null | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    nom_client: string;
    telephone: string;
    adresse: string;
    ville: string;
    produits: {
        id: string;
        nom: string;
        prix: number;
        quantite: number;
        taille?: string | null | undefined;
        couleur?: string | null | undefined;
        image_url?: string | null | undefined;
    }[];
    email?: string | undefined;
}, {
    nom_client: string;
    telephone: string;
    adresse: string;
    ville: string;
    produits: {
        id: string;
        nom: string;
        prix: number;
        quantite: number;
        taille?: string | null | undefined;
        couleur?: string | null | undefined;
        image_url?: string | null | undefined;
    }[];
    email?: string | undefined;
}>;
export declare const statutCommandeSchema: z.ZodObject<{
    nouveau_statut: z.ZodEnum<["En attente", "Expédiée", "Livrée", "Annulée"]>;
}, "strip", z.ZodTypeAny, {
    nouveau_statut: "En attente" | "Expédiée" | "Livrée" | "Annulée";
}, {
    nouveau_statut: "En attente" | "Expédiée" | "Livrée" | "Annulée";
}>;
export declare const commentaireSchema: z.ZodObject<{
    produit_id: z.ZodString;
    nom: z.ZodString;
    email: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    rating: z.ZodNumber;
    commentaire: z.ZodString;
    images: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    nom: string;
    produit_id: string;
    rating: number;
    commentaire: string;
    email?: string | undefined;
    images?: string[] | undefined;
}, {
    nom: string;
    produit_id: string;
    rating: number;
    commentaire: string;
    email?: string | undefined;
    images?: string[] | undefined;
}>;
export declare const updateCommentaireSchema: z.ZodObject<{
    nom: z.ZodOptional<z.ZodString>;
    email: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    rating: z.ZodOptional<z.ZodNumber>;
    commentaire: z.ZodOptional<z.ZodString>;
    images: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    nom?: string | undefined;
    email?: string | undefined;
    rating?: number | undefined;
    commentaire?: string | undefined;
    images?: string[] | undefined;
}, {
    nom?: string | undefined;
    email?: string | undefined;
    rating?: number | undefined;
    commentaire?: string | undefined;
    images?: string[] | undefined;
}>;
export declare const adminCommentActionSchema: z.ZodObject<{
    approved: z.ZodOptional<z.ZodBoolean>;
    flagged: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    approved?: boolean | undefined;
    flagged?: boolean | undefined;
}, {
    approved?: boolean | undefined;
    flagged?: boolean | undefined;
}>;
//# sourceMappingURL=schemas.d.ts.map