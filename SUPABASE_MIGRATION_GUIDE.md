# 🚀 Guide de Migration Supabase vers un Nouveau Compte

Ce guide vous aidera à migrer toutes vos données Supabase (base de données, storage, configurations) vers un nouveau compte Supabase.

## 📋 Prérequis

1. **Nouveau compte Supabase** créé et projet initialisé
2. **Supabase CLI** installé (`npm install -g supabase`)
3. **Accès aux deux comptes** (ancien et nouveau)
4. **psql** ou un client PostgreSQL pour les exports/imports

---

## 🔍 Étape 1: Audit de votre Configuration Actuelle

### Ce que vous avez actuellement:

✅ **Base de données:**
- Tables: `produits`, `commandes`, `admins`, `categories`, `settings`
- Migrations SQL (dans `supabase/migrations/`)
- Indexes (définis dans les migrations)
- RLS Policies (Row Level Security)
- Fonctions RPC (comme `decrementer_stock`)
- Triggers et extensions

✅ **Storage:**
- Bucket: `produits-images` (public)
- Fichiers/images des produits

✅ **Realtime:**
- Abonnements aux changements de `commandes`

❌ **Edge Functions:** 
- Déjà migrées vers Vercel API Routes (pas besoin de migrer)

❌ **Supabase Auth:**
- Vous utilisez une authentification custom (table `admins`), pas Supabase Auth

---

## 📦 Étape 2: Exporter les Données de l'Ancien Compte

### 2.1 Exporter le Schéma de la Base de Données

```bash
# Se connecter à l'ancien projet Supabase
# Récupérer la connection string depuis: Settings → Database → Connection string
# Format: postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres

# Exporter le schéma (structure)
pg_dump -h [OLD_HOST] -U postgres -d postgres \
  --schema-only \
  --no-owner \
  --no-privileges \
  -f schema_export.sql

# Exporter les données
pg_dump -h [OLD_HOST] -U postgres -d postgres \
  --data-only \
  --no-owner \
  --no-privileges \
  -f data_export.sql

# Exporter TOUT (schéma + données) - RECOMMANDÉ
pg_dump -h [OLD_HOST] -U postgres -d postgres \
  --no-owner \
  --no-privileges \
  --clean \
  -f full_export.sql
```

**Alternative via Supabase Dashboard:**
1. Allez dans **Database** → **Backups**
2. Créez un backup manuel
3. Téléchargez le backup SQL

### 2.2 Exporter les Fichiers Storage

```bash
# Installer Supabase CLI si pas déjà fait
npm install -g supabase

# Se connecter à l'ancien projet
supabase login
supabase link --project-ref [OLD_PROJECT_REF]

# Créer un script pour télécharger tous les fichiers
# Créez un fichier download-storage.js
```

**Script de téléchargement Storage:**

```javascript
// download-storage.js
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const OLD_SUPABASE_URL = process.env.OLD_SUPABASE_URL
const OLD_SUPABASE_SERVICE_KEY = process.env.OLD_SUPABASE_SERVICE_KEY
const DOWNLOAD_DIR = './storage-backup'

const supabase = createClient(OLD_SUPABASE_URL, OLD_SUPABASE_SERVICE_KEY)

async function downloadStorage() {
  // Créer le dossier de backup
  if (!fs.existsSync(DOWNLOAD_DIR)) {
    fs.mkdirSync(DOWNLOAD_DIR, { recursive: true })
  }

  const bucketName = 'produits-images'
  const bucketDir = path.join(DOWNLOAD_DIR, bucketName)
  if (!fs.existsSync(bucketDir)) {
    fs.mkdirSync(bucketDir, { recursive: true })
  }

  // Lister tous les fichiers
  const { data: files, error } = await supabase.storage
    .from(bucketName)
    .list('', {
      limit: 1000,
      offset: 0,
    })

  if (error) {
    console.error('Erreur lors de la liste:', error)
    return
  }

  console.log(`Trouvé ${files.length} fichiers à télécharger`)

  // Télécharger chaque fichier
  for (const file of files) {
    const { data, error: downloadError } = await supabase.storage
      .from(bucketName)
      .getPublicUrl(file.name)

    if (downloadError) {
      console.error(`Erreur pour ${file.name}:`, downloadError)
      continue
    }

    // Télécharger le fichier
    const response = await fetch(data.publicUrl)
    const buffer = await response.arrayBuffer()
    const filePath = path.join(bucketDir, file.name)
    
    // Créer les dossiers nécessaires
    const dir = path.dirname(filePath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    fs.writeFileSync(filePath, Buffer.from(buffer))
    console.log(`✅ Téléchargé: ${file.name}`)
  }

  console.log('✅ Téléchargement terminé!')
}

downloadStorage().catch(console.error)
```

**Exécuter:**
```bash
# Ajouter les variables d'env
export OLD_SUPABASE_URL="https://[old-project-ref].supabase.co"
export OLD_SUPABASE_SERVICE_KEY="[old-service-role-key]"

# Exécuter
node download-storage.js
```

---

## 🚀 Étape 3: Importer dans le Nouveau Compte

### 3.1 Créer le Nouveau Projet Supabase

1. Allez sur https://supabase.com/dashboard
2. Créez un nouveau projet
3. Notez le **Project Reference ID** et les **API Keys**

### 3.2 Importer le Schéma et les Données

```bash
# Récupérer la connection string du nouveau projet
# Settings → Database → Connection string

# Importer le schéma et les données
psql -h [NEW_HOST] -U postgres -d postgres -f full_export.sql

# OU via Supabase CLI
supabase db reset --db-url "postgresql://postgres:[PASSWORD]@[NEW_HOST]:5432/postgres"
```

**Alternative via Supabase Dashboard:**
1. Allez dans **SQL Editor**
2. Collez le contenu de `full_export.sql`
3. Exécutez le script

### 3.3 Appliquer les Migrations (Optionnel mais Recommandé)

Si vous préférez utiliser vos fichiers de migration:

```bash
# Lier le nouveau projet
supabase link --project-ref [NEW_PROJECT_REF]

# Appliquer toutes les migrations
supabase db push
```

### 3.4 Vérifier les Tables et Données

```sql
-- Vérifier que toutes les tables existent
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Vérifier le nombre de lignes
SELECT 
  'produits' as table_name, COUNT(*) as count FROM produits
UNION ALL
SELECT 'commandes', COUNT(*) FROM commandes
UNION ALL
SELECT 'admins', COUNT(*) FROM admins
UNION ALL
SELECT 'categories', COUNT(*) FROM categories;
```

### 3.5 Importer les Fichiers Storage

**Créer le bucket:**
```sql
-- Via SQL Editor dans Supabase Dashboard
INSERT INTO storage.buckets (id, name, public)
VALUES ('produits-images', 'produits-images', true);
```

**Script d'upload:**
```javascript
// upload-storage.js
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const NEW_SUPABASE_URL = process.env.NEW_SUPABASE_URL
const NEW_SUPABASE_SERVICE_KEY = process.env.NEW_SUPABASE_SERVICE_KEY
const STORAGE_DIR = './storage-backup/produits-images'

const supabase = createClient(NEW_SUPABASE_URL, NEW_SUPABASE_SERVICE_KEY)

async function uploadStorage() {
  // Lister tous les fichiers dans le dossier
  const files = getAllFiles(STORAGE_DIR)
  
  console.log(`Trouvé ${files.length} fichiers à uploader`)

  for (const filePath of files) {
    const relativePath = path.relative(STORAGE_DIR, filePath)
    const fileBuffer = fs.readFileSync(filePath)
    
    const { data, error } = await supabase.storage
      .from('produits-images')
      .upload(relativePath, fileBuffer, {
        contentType: getContentType(filePath),
        upsert: true
      })

    if (error) {
      console.error(`❌ Erreur pour ${relativePath}:`, error)
    } else {
      console.log(`✅ Uploadé: ${relativePath}`)
    }
  }

  console.log('✅ Upload terminé!')
}

function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir)
  files.forEach(file => {
    const filePath = path.join(dir, file)
    if (fs.statSync(filePath).isDirectory()) {
      getAllFiles(filePath, fileList)
    } else {
      fileList.push(filePath)
    }
  })
  return fileList
}

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase()
  const types = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif'
  }
  return types[ext] || 'application/octet-stream'
}

uploadStorage().catch(console.error)
```

**Exécuter:**
```bash
export NEW_SUPABASE_URL="https://[new-project-ref].supabase.co"
export NEW_SUPABASE_SERVICE_KEY="[new-service-role-key]"

node upload-storage.js
```

### 3.6 Configurer les RLS Policies

Vérifiez que toutes les RLS policies sont bien appliquées. Si elles ne sont pas dans votre export SQL, appliquez-les manuellement:

```sql
-- Exemple: Vérifier les policies existantes
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public';
```

### 3.7 Activer Realtime

```sql
-- Activer Realtime pour la table commandes (si pas déjà fait)
ALTER PUBLICATION supabase_realtime ADD TABLE commandes;
```

---

## 🔧 Étape 4: Mettre à Jour les Variables d'Environnement

### 4.1 Variables Locales (.env.local)

```bash
# Remplacer les anciennes valeurs
NEXT_PUBLIC_SUPABASE_URL=https://[new-project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[new-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[new-service-role-key]
```

### 4.2 Variables Vercel

1. Allez sur https://vercel.com/dashboard
2. Sélectionnez votre projet
3. **Settings** → **Environment Variables**
4. Mettez à jour:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
5. **Redéployez** votre application

---

## ✅ Étape 5: Vérifications Finales

### 5.1 Tester la Base de Données

```bash
# Se connecter au nouveau projet
supabase link --project-ref [NEW_PROJECT_REF]

# Ouvrir Supabase Studio
supabase studio
```

Vérifiez:
- ✅ Toutes les tables existent
- ✅ Les données sont présentes
- ✅ Les indexes sont créés
- ✅ Les RLS policies sont actives

### 5.2 Tester le Storage

```bash
# Vérifier que les fichiers sont accessibles
curl https://[new-project-ref].supabase.co/storage/v1/object/public/produits-images/[nom-fichier]
```

### 5.3 Tester l'Application

1. **Localement:**
   ```bash
   npm run dev
   ```
   - Testez l'affichage des produits
   - Testez l'upload d'images
   - Testez la création de commandes

2. **En Production:**
   - Vérifiez que Vercel utilise les nouvelles variables
   - Testez toutes les fonctionnalités

---

## 🛠️ Scripts Automatisés

Créez un dossier `scripts/migration/` avec les scripts suivants:

### export-old-project.sh
```bash
#!/bin/bash
# Export complet de l'ancien projet

OLD_PROJECT_REF=$1
OLD_DB_PASSWORD=$2

echo "📦 Export de l'ancien projet..."

# Export DB
pg_dump -h db.$OLD_PROJECT_REF.supabase.co \
  -U postgres \
  -d postgres \
  --no-owner \
  --no-privileges \
  -f ./migration-backup/db_export.sql

echo "✅ Export DB terminé"
```

### import-new-project.sh
```bash
#!/bin/bash
# Import dans le nouveau projet

NEW_PROJECT_REF=$1
NEW_DB_PASSWORD=$2

echo "🚀 Import dans le nouveau projet..."

# Import DB
psql -h db.$NEW_PROJECT_REF.supabase.co \
  -U postgres \
  -d postgres \
  -f ./migration-backup/db_export.sql

echo "✅ Import DB terminé"
```

---

## ⚠️ Points d'Attention

1. **Downtime:** Planifiez une fenêtre de maintenance pour éviter les pertes de données
2. **Backup:** Gardez toujours un backup de l'ancien projet pendant au moins 30 jours
3. **IDs:** Les IDs des enregistrements seront préservés si vous utilisez `pg_dump` complet
4. **Storage URLs:** Les URLs des images changeront, mais les chemins relatifs resteront identiques
5. **Realtime:** Vérifiez que les abonnements Realtime fonctionnent correctement

---

## 📞 Support

Si vous rencontrez des problèmes:
1. Vérifiez les logs Supabase: **Logs** → **Postgres Logs**
2. Vérifiez les logs Vercel: **Deployments** → **Functions Logs**
3. Consultez la documentation Supabase: https://supabase.com/docs

---

## ✅ Checklist de Migration

- [ ] Export de la base de données (schéma + données)
- [ ] Export des fichiers Storage
- [ ] Création du nouveau projet Supabase
- [ ] Import de la base de données
- [ ] Création du bucket Storage
- [ ] Upload des fichiers Storage
- [ ] Vérification des RLS policies
- [ ] Activation de Realtime
- [ ] Mise à jour des variables d'environnement (local)
- [ ] Mise à jour des variables d'environnement (Vercel)
- [ ] Redéploiement sur Vercel
- [ ] Tests complets de l'application
- [ ] Vérification des logs et monitoring
- [ ] Backup de l'ancien projet conservé

---

**Temps estimé:** 2-4 heures selon la taille des données

**Difficulté:** Moyenne

**Risque:** Faible si les étapes sont suivies correctement

