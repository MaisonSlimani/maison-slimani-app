import { z } from 'zod';
import { commandeSchema, commentaireSchema, updateCommentaireSchema, adminCommentActionSchema, commandeProduitSchema } from '../validation/schemas';
export type CommandePayload = z.infer<typeof commandeSchema>;
export type CommandeProduit = z.infer<typeof commandeProduitSchema>;
export type CommentairePayload = z.infer<typeof commentaireSchema>;
export type UpdateCommentairePayload = z.infer<typeof updateCommentaireSchema>;
export type AdminCommentActionPayload = z.infer<typeof adminCommentActionSchema>;
export interface CartItem {
    id: string;
    nom: string;
    prix: number;
    quantite: number;
    image_url?: string;
    image?: string;
    taille?: string;
    couleur?: string;
    stock?: number;
    categorie?: string;
    slug?: string;
    categorySlug?: string;
}
export interface DomainResult<T> {
    success: boolean;
    data?: T;
    error?: string;
}
//# sourceMappingURL=index.d.ts.map