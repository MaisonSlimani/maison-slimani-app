# Maison Slimani Admin PWA

Application d'administration mobile pour Maison Slimani.

## Installation

```bash
cd admin-app
npm install
```

## Configuration

Créer un fichier `.env.local` avec :

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ADMIN_SESSION_SECRET=your_session_secret
```

## Développement

```bash
npm run dev
```

L'application démarre sur `http://localhost:3001`

## Build

```bash
npm run build
npm start
```

## Capacitor (App Stores)

```bash
# Installer Capacitor CLI
npm install -g @capacitor/cli

# Installer les plugins
npm install @capacitor/core @capacitor/ios @capacitor/android
npm install @capacitor/push-notifications @capacitor/camera

# Synchroniser
npm run admin:cap:sync

# Ouvrir les projets natifs
npm run admin:cap:android  # Android
npm run admin:cap:ios      # iOS
```

## Déploiement

Déployer sur Vercel avec le domaine `admin.maisonslimani.ma`

## Features

- ✅ **Bottom Navigation Bar** - Native Android app style navigation
- ✅ **Sticky Header** - Quick access to logo and logout
- ✅ **Dashboard** - Real-time stats and recent orders
- ✅ **Orders Management** - View and update order status
- ✅ **Products Management** - Manage product catalog
- ✅ **Settings** - Configure business information
- ✅ **Full PWA Support** - Installable, offline-capable

## Structure

- `app/` - Routes Next.js
- `components/admin-pwa/` - Composants PWA spécifiques (BottomNav, StickyHeader, etc.)
- `lib/` - Utilitaires et authentification
- `public/` - Assets statiques et manifest

## Setup

See [SETUP.md](./SETUP.md) for detailed environment variable configuration..



