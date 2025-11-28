# Maison Slimani - Site E-commerce

Site e-commerce haut de gamme pour chaussures homme en cuir, développé avec Next.js 15 et Supabase.

## Technologies

- **Next.js 15** (App Router, TypeScript)
- **Supabase** (Base de données, Authentification, Storage, Realtime)
- **Resend** (Emails transactionnels)
- **TailwindCSS** + **Framer Motion** + **shadcn/ui**
- **Vercel** (Hébergement)

## Structure du projet

```
maison-slimani-experience/
├── app/                    # Pages Next.js (App Router)
│   ├── admin/             # Dashboard admin
│   ├── api/               # API Routes
│   ├── boutique/          # Page boutique
│   ├── contact/           # Page contact
│   ├── maison/            # Page "La Maison"
│   ├── panier/            # Page panier
│   ├── checkout/           # Page checkout
│   └── commande/           # Confirmation commande
├── components/             # Composants React
├── lib/                    # Utilitaires et configurations
│   ├── auth/              # Authentification admin
│   ├── hooks/             # Hooks React (useCart)
│   ├── supabase/          # Configuration Supabase
│   └── resend/            # Configuration Resend
├── supabase/               # Configuration Supabase
│   └── migrations/        # Migrations SQL
└── public/                 # Assets statiques
```

## Installation

1. Installer les dépendances :
```bash
npm install
```

2. Configurer les variables d'environnement :
Créer un fichier `.env.local` avec :
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Resend
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=noreply@maisonslimani.com
ADMIN_EMAIL=admin@maisonslimani.com

# Note: ADMIN_SESSION_SECRET is only needed for admin-app, not the main app
```

3. Initialiser Supabase :
```bash
supabase init
supabase start
```

4. Appliquer les migrations :
```bash
supabase db reset
```

5. Configurer Supabase Storage :
- Créer un bucket `produits-images` (public)
- Configurer les politiques d'accès

6. Lancer le serveur de développement :
```bash
npm run dev
```

## Configuration Supabase

### Tables

- `produits` : Catalogue des produits
- `commandes` : Commandes clients (COD)
- `admins` : Administrateurs du site

### API Routes Vercel

- `GET /api/produits` : Récupère les produits (filtres, pagination, vedettes)
- `GET /api/produits/[id]` et `GET /api/produits/by-slug/[slug]` : Détails produit
- `POST /api/commandes` : Crée une commande, vérifie le stock et déclenche les emails
- `GET /api/admin/commandes`, `PATCH /api/admin/commandes/[id]` : Gestion commandes admin
- `POST /api/emails` : Envoi d'emails transactionnels via Resend
- `GET /api/categories` : Récupère les catégories actives

## Configuration Admin

1. Créer un admin dans la table `admins` :
```sql
INSERT INTO admins (email, hash_mdp, role)
VALUES (
  'admin@maisonslimani.com',
  '$2a$12$...', -- Hash bcrypt du mot de passe
  'super-admin'
);
```

Pour générer le hash :
```javascript
const bcrypt = require('bcryptjs');
const hash = await bcrypt.hash('votre_mot_de_passe', 12);
```

2. Se connecter via admin-app (separate application)

## Fonctionnalités

### Client
- Navigation responsive (desktop + mobile)
- Catalogue produits avec filtres
- Panier (localStorage)
- Checkout COD (Cash on Delivery)
- Confirmation de commande
- Formulaire de contact

### Admin
- Authentification sécurisée
- Dashboard avec statistiques
- Gestion produits (CRUD)
- Gestion commandes (statuts, export CSV)
- Paramètres

## Emails

Les emails sont envoyés via Resend :
- Confirmation de commande (client)
- Notification nouvelle commande (admin)
- Notification changement de statut (client)

## Notes

- Tous les commentaires et messages sont en français
- Pas de compte client requis (approche COD)
- Images optimisées (WebP)
- SEO optimisé
- Architecture scalable

## Déploiement

Le projet est prêt pour le déploiement sur Vercel :
1. Connecter le repo GitHub à Vercel
2. Configurer les variables d'environnement
3. Déployer

## Support

Pour toute question, contactez l'équipe de développement.
