# 🚀 Plan de Migration: Supabase Edge Functions → Vercel API Routes

## 📋 Vue d'Ensemble

**Objectif:** Migrer toutes les Supabase Edge Functions vers Vercel API Routes pour améliorer les performances, simplifier le développement et réduire les coûts.

---

## 🎯 Ce qui RESTE sur Supabase

### ✅ Database (PostgreSQL)
- **Tables:** `produits`, `commandes`, `admins`, `categories`
- **Fonctions RPC:** `decrementer_stock` (garder dans DB)
- **Migrations:** Toutes les migrations SQL
- **RLS Policies:** Configuration de sécurité

### ✅ Authentication
- **Système d'auth:** Supabase Auth (magic links, OAuth, etc.)
- **Sessions:** Gestion des sessions utilisateur
- **Middleware:** Vérification d'authentification

### ✅ Storage
- **Bucket:** `produits-images` pour les images de produits
- **Policies:** Politiques d'accès public/privé

### ✅ Realtime
- **Subscriptions:** Mises à jour en temps réel (dashboard admin)
- **Channels:** Abonnements aux changements de commandes

---

## 🔄 Ce qui MIGRE vers Vercel

### 1. `recupererProduits` → `app/api/produits/route.ts`
**Fonction actuelle:** Récupère les produits avec filtres (catégorie, vedette, pagination)

**Nouveau endpoint:** `GET /api/produits`

### 2. `ajouterCommande` → `app/api/commandes/route.ts`
**Fonction actuelle:** Crée une commande, vérifie le stock, décrémente le stock

**Nouveau endpoint:** `POST /api/commandes`

### 3. `recupererCommandes` → `app/api/admin/commandes/route.ts`
**Fonction actuelle:** Récupère les commandes (admin uniquement)

**Nouveau endpoint:** `GET /api/admin/commandes` (déjà existe, à migrer)

### 4. `changerStatutCommande` → `app/api/admin/commandes/[id]/route.ts`
**Fonction actuelle:** Change le statut d'une commande

**Nouveau endpoint:** `PATCH /api/admin/commandes/[id]`

### 5. `envoyerEmailCommande` → `app/api/emails/route.ts`
**Fonction actuelle:** Envoie les emails via Resend

**Nouveau endpoint:** `POST /api/emails`

---

## 📝 Plan de Migration Détaillé

### Phase 1: Préparation (30 min)

#### 1.1 Créer les validations partagées
**Fichier:** `lib/validations.ts` (nouveau)

```typescript
import { z } from 'zod'

// Validation pour les produits
export const produitQuerySchema = z.object({
  categorie: z.enum(['Classiques', 'Cuirs Exotiques', 'Éditions Limitées', 'Nouveautés']).optional(),
  vedette: z.string().transform(val => val === 'true').optional(),
  limit: z.string().transform(Number).pipe(z.number().int().positive().max(100)).optional(),
  offset: z.string().transform(Number).pipe(z.number().int().nonnegative()).optional(),
})

// Validation pour les commandes
export const commandeSchema = z.object({
  nom_client: z.string().min(1, 'Le nom est requis'),
  telephone: z.string().min(1, 'Le téléphone est requis'),
  adresse: z.string().min(1, 'L\'adresse est requise'),
  ville: z.string().min(1, 'La ville est requise'),
  produits: z.array(z.object({
    id: z.string().uuid(),
    nom: z.string(),
    prix: z.number().positive(),
    quantite: z.number().int().positive(),
    image_url: z.string().optional().nullable(),
    taille: z.string().optional().nullable(),
    couleur: z.string().optional().nullable(),
  })).min(1, 'Au moins un produit est requis'),
})

// Validation pour changer le statut
export const statutCommandeSchema = z.object({
  nouveau_statut: z.enum(['En attente', 'Expédiée', 'Livrée', 'Annulée']),
})
```

#### 1.2 Créer les utilitaires email
**Fichier:** `lib/emails/templates.ts` (nouveau)

Déplacer les templates email depuis `envoyerEmailCommande/index.ts`

#### 1.3 Créer le service Resend
**Fichier:** `lib/resend/client.ts` (vérifier si existe, sinon créer)

---

### Phase 2: Migration des API Routes (2-3 heures)

#### 2.1 Migrer `recupererProduits` → `/api/produits`

**Fichier à créer:** `app/api/produits/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { produitQuerySchema } from '@/lib/validations'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Parser les query params
    const searchParams = request.nextUrl.searchParams
    const queryParams = Object.fromEntries(searchParams.entries())
    const validatedParams = produitQuerySchema.parse(queryParams)
    
    // Construire la requête
    let query = supabase
      .from('produits')
      .select('*')
      .order('date_ajout', { ascending: false })
    
    // Appliquer les filtres
    if (validatedParams.categorie) {
      query = query.eq('categorie', validatedParams.categorie)
    }
    
    if (validatedParams.vedette !== undefined) {
      query = query.eq('vedette', validatedParams.vedette)
    }
    
    // Pagination
    const limit = validatedParams.limit || 20
    const offset = validatedParams.offset || 0
    query = query.range(offset, offset + limit - 1)
    
    // Exécuter
    const { data, error, count } = await query
    
    if (error) throw error
    
    return NextResponse.json({
      success: true,
      data: data || [],
      count: count || data?.length || 0,
    })
  } catch (error) {
    console.error('Erreur lors de la récupération des produits:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 400 }
    )
  }
}
```

**Fichiers à modifier:**
- `app/page.tsx` - Remplacer l'appel direct Supabase par `/api/produits`
- `app/boutique/[categorie]/page.tsx` - Idem

---

#### 2.2 Migrer `ajouterCommande` → `/api/commandes`

**Fichier à créer:** `app/api/commandes/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { commandeSchema } from '@/lib/validations'
import { sendCommandeEmails } from '@/lib/emails/send'

const villesMaroc = [
  'Casablanca', 'Rabat', 'Fès', 'Marrakech', 'Tanger', 'Agadir',
  'Meknès', 'Oujda', 'Kenitra', 'Tétouan', 'Safi', 'Mohammedia',
  'El Jadida', 'Nador', 'Settat', 'Beni Mellal', 'Taza', 'Khouribga',
  'Autre'
]

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    // Valider
    const validatedData = commandeSchema.parse(body)
    
    // Vérifier la ville
    if (!villesMaroc.includes(validatedData.ville)) {
      return NextResponse.json(
        { success: false, error: 'Ville invalide' },
        { status: 400 }
      )
    }
    
    // Vérifier le stock et calculer le total
    let total = 0
    const produitsAvecStock = []
    
    for (const produitCommande of validatedData.produits) {
      const { data: produit, error: produitError } = await supabase
        .from('produits')
        .select('id, nom, prix, stock, has_colors, couleurs')
        .eq('id', produitCommande.id)
        .single()
      
      if (produitError || !produit) {
        throw new Error(`Produit ${produitCommande.nom} introuvable`)
      }
      
      // Vérifier le stock (logique existante)
      // ... (copier depuis ajouterCommande/index.ts lignes 108-143)
      
      total += produit.prix * produitCommande.quantite
      produitsAvecStock.push({
        ...produitCommande,
        prix: produit.prix,
      })
    }
    
    // Créer la commande
    const { data: commande, error: commandeError } = await supabase
      .from('commandes')
      .insert({
        nom_client: validatedData.nom_client,
        telephone: validatedData.telephone,
        adresse: validatedData.adresse,
        ville: validatedData.ville,
        produits: produitsAvecStock,
        total: total,
        statut: 'En attente',
      })
      .select()
      .single()
    
    if (commandeError) throw commandeError
    
    // Décrémenter le stock (logique existante)
    // ... (copier depuis ajouterCommande/index.ts lignes 166-205)
    
    // Envoyer les emails (en arrière-plan, ne pas bloquer)
    sendCommandeEmails(commande).catch(console.error)
    
    return NextResponse.json({
      success: true,
      data: commande,
    }, { status: 201 })
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la commande:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 400 }
    )
  }
}
```

**Fichiers à modifier:**
- `app/checkout/page.tsx` - Ligne 171: Remplacer `/functions/v1/ajouterCommande` par `/api/commandes`

---

#### 2.3 Migrer `recupererCommandes` → `/api/admin/commandes`

**Fichier à modifier:** `app/api/admin/commandes/route.ts` (existe déjà, vérifier et améliorer)

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyAdmin } from '@/lib/auth/admin' // À créer si n'existe pas

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification admin
    const isAdmin = await verifyAdmin(request)
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Non autorisé' },
        { status: 401 }
      )
    }
    
    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams
    
    // Parser les query params
    const statut = searchParams.get('statut')
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)
    
    // Construire la requête
    let query = supabase
      .from('commandes')
      .select('*')
      .order('date_commande', { ascending: false })
    
    if (statut) {
      query = query.eq('statut', statut)
    }
    
    query = query.range(offset, offset + limit - 1)
    
    const { data, error, count } = await query
    
    if (error) throw error
    
    return NextResponse.json({
      success: true,
      data: data || [],
      count: count || data?.length || 0,
    })
  } catch (error) {
    console.error('Erreur lors de la récupération des commandes:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 400 }
    )
  }
}
```

---

#### 2.4 Migrer `changerStatutCommande` → `/api/admin/commandes/[id]`

**Fichier à créer:** `app/api/admin/commandes/[id]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyAdmin } from '@/lib/auth/admin'
import { statutCommandeSchema } from '@/lib/validations'
import { sendStatutChangeEmail } from '@/lib/emails/send'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Vérifier l'authentification admin
    const isAdmin = await verifyAdmin(request)
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Non autorisé' },
        { status: 401 }
      )
    }
    
    const supabase = await createClient()
    const body = await request.json()
    const validatedData = statutCommandeSchema.parse(body)
    
    // Récupérer l'ancien statut
    const { data: ancienneCommande, error: fetchError } = await supabase
      .from('commandes')
      .select('*')
      .eq('id', params.id)
      .single()
    
    if (fetchError || !ancienneCommande) {
      return NextResponse.json(
        { success: false, error: 'Commande introuvable' },
        { status: 404 }
      )
    }
    
    // Mettre à jour le statut
    const { data: commande, error: updateError } = await supabase
      .from('commandes')
      .update({ statut: validatedData.nouveau_statut })
      .eq('id', params.id)
      .select()
      .single()
    
    if (updateError) throw updateError
    
    // Envoyer email si le statut a changé
    if (ancienneCommande.statut !== validatedData.nouveau_statut && 
        validatedData.nouveau_statut !== 'En attente') {
      sendStatutChangeEmail(commande, ancienneCommande.statut, validatedData.nouveau_statut)
        .catch(console.error)
    }
    
    return NextResponse.json({
      success: true,
      data: commande,
    })
  } catch (error) {
    console.error('Erreur lors du changement de statut:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 400 }
    )
  }
}
```

**Fichiers à modifier:**
- `app/admin/commandes/page.tsx` - Remplacer l'appel Edge Function par `/api/admin/commandes/[id]`

---

#### 2.5 Migrer `envoyerEmailCommande` → `/api/emails`

**Fichier à créer:** `app/api/emails/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { sendCommandeEmails, sendStatutChangeEmail } from '@/lib/emails/send'
import { z } from 'zod'

const emailSchema = z.object({
  type: z.enum(['commande', 'statut', 'contact']),
  commande: z.any().optional(),
  ancien_statut: z.string().optional(),
  nouveau_statut: z.string().optional(),
  // ... autres champs selon le type
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = emailSchema.parse(body)
    
    if (validatedData.type === 'commande' && validatedData.commande) {
      await sendCommandeEmails(validatedData.commande)
    } else if (validatedData.type === 'statut' && validatedData.commande) {
      await sendStatutChangeEmail(
        validatedData.commande,
        validatedData.ancien_statut!,
        validatedData.nouveau_statut!
      )
    }
    // ... autres types
    
    return NextResponse.json({
      success: true,
      message: 'Email envoyé avec succès',
    })
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 400 }
    )
  }
}
```

**Fichiers à modifier:**
- `app/api/contact/route.ts` - Ligne 23: Remplacer l'appel Edge Function par `/api/emails`
- `app/api/commandes/route.ts` - Utiliser directement `sendCommandeEmails()`

---

### Phase 3: Créer les utilitaires (1 heure)

#### 3.1 Service Email
**Fichier:** `lib/emails/send.ts`

```typescript
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendCommandeEmails(commande: any) {
  // Envoyer email client
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: commande.nom_client, // TODO: Ajouter email dans commande
    subject: `Confirmation de commande - Maison Slimani`,
    html: generateClientEmailTemplate(commande),
  })
  
  // Envoyer email admin
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: process.env.ADMIN_EMAIL!,
    subject: `Nouvelle commande #${commande.id.substring(0, 8)}`,
    html: generateAdminEmailTemplate(commande),
  })
}

export async function sendStatutChangeEmail(
  commande: any,
  ancienStatut: string,
  nouveauStatut: string
) {
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: process.env.ADMIN_EMAIL!,
    subject: `Commande ${commande.id.substring(0, 8)} - Statut changé`,
    html: generateStatutChangeTemplate(commande, ancienStatut, nouveauStatut),
  })
}
```

#### 3.2 Templates Email
**Fichier:** `lib/emails/templates.ts`

Déplacer les templates depuis `envoyerEmailCommande/index.ts`

---

### Phase 4: Mise à jour du Frontend (1 heure)

#### 4.1 Remplacer les appels Edge Functions

**Fichiers à modifier:**

1. **`app/checkout/page.tsx`**
   ```typescript
   // AVANT
   const response = await fetch(`${supabaseUrl}/functions/v1/ajouterCommande`, {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
       'Authorization': `Bearer ${session?.access_token || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
     },
     body: JSON.stringify(commandeData),
   })
   
   // APRÈS
   const response = await fetch('/api/commandes', {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
     },
     body: JSON.stringify(commandeData),
   })
   ```

2. **`app/page.tsx`** (produits vedette)
   ```typescript
   // AVANT
   const { data: vedette } = await supabase
     .from('produits')
     .select('*')
     .eq('vedette', true)
     .limit(6)
     .order('date_ajout', { ascending: false })
   
   // APRÈS
   const response = await fetch('/api/produits?vedette=true&limit=6')
   const { data: vedette } = await response.json()
   ```

3. **`app/boutique/[categorie]/page.tsx`**
   ```typescript
   // Remplacer les appels directs Supabase par /api/produits
   ```

4. **`app/admin/commandes/page.tsx`**
   ```typescript
   // Remplacer les appels Edge Functions par /api/admin/commandes
   ```

---

### Phase 5: Tests et Nettoyage (1 heure)

#### 5.1 Tests
- [ ] Tester `/api/produits` avec différents filtres
- [ ] Tester `/api/commandes` (création de commande)
- [ ] Tester `/api/admin/commandes` (liste et changement de statut)
- [ ] Tester `/api/emails` (envoi d'emails)
- [ ] Vérifier que les emails sont bien envoyés

#### 5.2 Nettoyage
- [ ] Supprimer le dossier `supabase/functions/` (garder seulement les migrations)
- [ ] Mettre à jour `README.md` (supprimer les instructions de déploiement Edge Functions)
- [ ] Mettre à jour `package.json` (supprimer les scripts liés aux Edge Functions si existent)
- [ ] Mettre à jour `.gitignore` si nécessaire

---

## 📊 Checklist de Migration

### Préparation
- [ ] Créer `lib/validations.ts`
- [ ] Créer `lib/emails/send.ts`
- [ ] Créer `lib/emails/templates.ts`
- [ ] Vérifier/créer `lib/auth/admin.ts` pour vérification admin

### Migration API Routes
- [ ] Créer `app/api/produits/route.ts`
- [ ] Créer `app/api/commandes/route.ts`
- [ ] Modifier `app/api/admin/commandes/route.ts`
- [ ] Créer `app/api/admin/commandes/[id]/route.ts`
- [ ] Créer `app/api/emails/route.ts`

### Mise à jour Frontend
- [ ] Modifier `app/checkout/page.tsx`
- [ ] Modifier `app/page.tsx`
- [ ] Modifier `app/boutique/[categorie]/page.tsx`
- [ ] Modifier `app/admin/commandes/page.tsx`
- [ ] Modifier `app/api/contact/route.ts`

### Tests
- [ ] Tester toutes les routes API
- [ ] Vérifier les emails
- [ ] Tester sur mobile (performance)

### Nettoyage
- [ ] Supprimer `supabase/functions/`
- [ ] Mettre à jour la documentation
- [ ] Commit et push

---

## 🎯 Bénéfices Attendus

### Performance
- ✅ **Latence réduite:** 500-1000ms → 100-300ms (cold start)
- ✅ **Edge Functions:** <50ms pour les routes critiques
- ✅ **Même réseau:** Pas de latence externe

### Développement
- ✅ **Code partagé:** Même TypeScript, validations, types
- ✅ **Debugging:** Logs unifiés dans Vercel
- ✅ **Hot reload:** Développement plus rapide

### Coûts
- ✅ **Gratuit:** Vercel Functions inclus dans le plan
- ✅ **Moins d'invocations:** Pas de latence réseau = moins cher

---

## ⚠️ Points d'Attention

1. **Variables d'environnement:**
   - Vérifier que toutes les variables sont configurées dans Vercel
   - `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `ADMIN_EMAIL`

2. **Authentification Admin:**
   - Créer `lib/auth/admin.ts` pour vérifier les sessions admin
   - Utiliser les cookies de session existants

3. **Stock:**
   - La fonction RPC `decrementer_stock` reste dans Supabase (c'est bien)
   - Vérifier que la logique de décrémentation fonctionne

4. **Emails:**
   - Les emails doivent être envoyés en arrière-plan (ne pas bloquer)
   - Gérer les erreurs silencieusement

5. **Backward Compatibility:**
   - Pendant la migration, garder les Edge Functions actives
   - Migrer progressivement, tester chaque route
   - Une fois tout testé, supprimer les Edge Functions

---

## 📅 Timeline Estimée

- **Phase 1 (Préparation):** 30 min
- **Phase 2 (Migration API):** 2-3 heures
- **Phase 3 (Utilitaires):** 1 heure
- **Phase 4 (Frontend):** 1 heure
- **Phase 5 (Tests):** 1 heure

**Total:** ~6-7 heures

---

## 🚀 Commande de Démarrage

```bash
# 1. Créer les fichiers de base
touch lib/validations.ts
mkdir -p lib/emails
touch lib/emails/send.ts
touch lib/emails/templates.ts

# 2. Commencer par la migration la plus simple
# (recupererProduits → /api/produits)

# 3. Tester chaque route avant de passer à la suivante

# 4. Une fois tout migré, supprimer supabase/functions/
```

---

**Prêt à commencer? Commencez par la Phase 1!** 🎯

