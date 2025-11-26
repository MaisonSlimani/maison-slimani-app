# Scripts de Migration Supabase

Ces scripts facilitent la migration de votre projet Supabase vers un nouveau compte.

## 📋 Prérequis

1. Node.js installé
2. Accès aux deux projets Supabase (ancien et nouveau)
3. Les clés API des deux projets

## 🚀 Utilisation

### Étape 1: Télécharger le Storage de l'Ancien Projet

```bash
# Configurer les variables d'environnement
export OLD_SUPABASE_URL="https://[old-project-ref].supabase.co"
export OLD_SUPABASE_SERVICE_KEY="[old-service-role-key]"

# Exécuter le script
node scripts/migration/download-storage.js
```

Les fichiers seront sauvegardés dans `storage-backup/produits-images/`

### Étape 2: Uploader le Storage vers le Nouveau Projet

```bash
# Configurer les variables d'environnement
export NEW_SUPABASE_URL="https://[new-project-ref].supabase.co"
export NEW_SUPABASE_SERVICE_KEY="[new-service-role-key]"

# Exécuter le script
node scripts/migration/upload-storage.js
```

## 📝 Notes

- Les scripts créent automatiquement le bucket s'il n'existe pas
- Les fichiers existants seront remplacés (upsert)
- La progression est affichée en temps réel
- Les erreurs sont loggées mais n'arrêtent pas le processus

## 🔍 Vérification

Après l'upload, vérifiez dans Supabase Dashboard:
- **Storage** → **produits-images** → Vérifier que tous les fichiers sont présents
- Tester l'accès public à quelques images

