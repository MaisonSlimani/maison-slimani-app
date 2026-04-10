/**
 * Pure domain logic for cart calculations and validations.
 * No dependencies on React, window, or localStorage.
 */
export const calculateTotal = (items) => {
    return items.reduce((acc, item) => acc + item.prix * item.quantite, 0);
};
export const validateQuantityUpdate = (item, newQuantity) => {
    if (newQuantity <= 0) {
        return { success: true, data: 0 };
    }
    if (item.stock !== undefined && item.stock !== null && item.stock < newQuantity) {
        return {
            success: false,
            error: `Stock insuffisant pour "${item.nom}". Stock disponible: ${item.stock}`,
        };
    }
    return { success: true, data: newQuantity };
};
export const validateAddToCart = (item, currentItems) => {
    if (item.stock === undefined || item.stock === null) {
        return { success: false, error: `Stock non disponible pour "${item.nom}"` };
    }
    if (item.stock <= 0) {
        return { success: false, error: `Produit "${item.nom}" en rupture de stock` };
    }
    const existing = item.couleur
        ? currentItems.find((i) => i.id === item.id && i.couleur === item.couleur && i.taille === item.taille)
        : currentItems.find((i) => i.id === item.id && !i.couleur && i.taille === item.taille);
    const totalQuantity = existing ? existing.quantite + item.quantite : item.quantite;
    if (item.stock !== undefined && item.stock !== null && item.stock < totalQuantity) {
        return {
            success: false,
            error: `Stock insuffisant pour "${item.nom}". Stock disponible: ${item.stock}`,
        };
    }
    return { success: true, data: item };
};
//# sourceMappingURL=cart.js.map