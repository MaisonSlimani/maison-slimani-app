# Gestion du Stock - Documentation

## Vue d'ensemble

La gestion du stock est bien implémentée à travers tout le site avec des vérifications à plusieurs niveaux.

## ✅ Vérifications du Stock

### 1. **Page Produit (Client)**
- ✅ Vérification du stock avant l'ajout au panier
- ✅ Limitation de la quantité maximum au stock disponible
- ✅ Affichage clair du stock disponible
- ✅ Désactivation du bouton "Ajouter au panier" si stock = 0

**Fichier**: `app/produit/[id]/page.tsx`
```typescript
// Vérification avant ajout
if (produit.stock < quantite) {
  toast.error('Stock insuffisant')
  return
}

// Limitation de la quantité
onClick={() => setQuantite(Math.min(produit.stock, quantite + 1))}
disabled={quantite >= produit.stock}
```

### 2. **Edge Function (Serveur) - Vérification Finale**
- ✅ Vérification du stock avant création de la commande
- ✅ Décrémentation automatique du stock après validation
- ✅ Erreur si stock insuffisant

**Fichier**: `supabase/functions/ajouterCommande/index.ts`
```typescript
// Vérification
if (produit.stock < produitCommande.quantite) {
  throw new Error(`Stock insuffisant pour ${produit.nom}`)
}

// Décrémentation
await supabase.rpc('decrementer_stock', {
  produit_id: produitCommande.id,
  quantite: produitCommande.quantite,
})
```

### 3. **Fonction RPC SQL**
- ✅ Décrémentation atomique du stock dans la base de données

**Fichier**: `supabase/migrations/003_create_rpc_functions.sql`
```sql
CREATE OR REPLACE FUNCTION decrementer_stock(
  produit_id UUID,
  quantite INTEGER
)
RETURNS VOID AS $$
BEGIN
  UPDATE produits
  SET stock = stock - quantite
  WHERE id = produit_id;
END;
$$ LANGUAGE plpgsql;
```

## 📊 Affichage du Stock dans l'Admin

### 1. **Tableau de Bord** (`/admin`)
- ✅ **Nouvelle rangée "Gestion du stock"** avec 3 métriques :
  - **Total stock** : Somme de tous les stocks
  - **Rupture de stock** : Nombre de produits avec stock = 0 (rouge)
  - **Stock faible (≤5)** : Nombre de produits avec stock ≤ 5 (orange)
- ✅ **Alertes visuelles** :
  - Alerte rouge si produits en rupture de stock
  - Alerte orange si produits avec stock faible
  - Boutons pour accéder directement aux produits

### 2. **Page Produits** (`/admin/produits/[categorie]`)
- ✅ **Affichage du stock** sur chaque carte produit avec :
  - **Icône** colorée (vert/orange/rouge selon le niveau)
  - **Nombre** en gras avec couleur correspondante
  - **Badge** "Rupture de stock" si stock = 0
  - **Badge** "Stock faible" avec icône d'alerte si stock ≤ 5

**Couleurs** :
- 🟢 **Vert** : Stock > 5 (bon stock)
- 🟠 **Orange** : Stock entre 1 et 5 (stock faible)
- 🔴 **Rouge** : Stock = 0 (rupture de stock)

### 3. **Formulaire de Création/Modification**
- ✅ Champ "Stock disponible" avec :
  - Validation minimum = 0
  - Message informatif : "Le stock sera automatiquement décrémenté lors des commandes"
  - **Alerte orange** si stock ≤ 5 : "Stock faible - Considérez réapprovisionner"
  - **Alerte rouge** si stock = 0 : "Rupture de stock - Le produit ne sera pas disponible à la vente"

## ⚠️ Points d'Attention

### Limitation Actuelle
- ⚠️ Le panier ne vérifie **pas** le stock en temps réel lors de la modification de quantité
- ✅ Le stock est vérifié lors de la commande (niveau serveur), donc pas de problème de sécurité
- 💡 **Recommandation** : Ajouter une vérification du stock lors de la modification de quantité dans le panier (optionnel)

### Flux de Gestion du Stock

1. **Ajout au panier** → Vérification côté client (limite quantité)
2. **Modification quantité** → Pas de vérification (mais limité par le stock du produit)
3. **Commande** → Vérification finale côté serveur (Edge Function)
4. **Validation** → Décrémentation automatique du stock (RPC SQL)
5. **Affichage admin** → Indicateurs visuels clairs pour le suivi

## 🎯 Résumé

La gestion du stock est **bien sécurisée** avec :
- ✅ Vérifications à plusieurs niveaux (client + serveur)
- ✅ Décrémentation automatique lors des commandes
- ✅ Affichage clair dans l'admin avec indicateurs visuels
- ✅ Alertes pour les stocks faibles ou en rupture
- ✅ Métriques de stock dans le tableau de bord

Le stock est maintenant **clairement visible** et **facile à gérer** depuis l'admin !

