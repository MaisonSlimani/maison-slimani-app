# ✅ Checklist de Migration Supabase

Utilisez cette checklist pour suivre votre progression lors de la migration.

## 📋 Préparation

- [ ] Nouveau compte Supabase créé
- [ ] Nouveau projet Supabase initialisé
- [ ] Accès aux deux projets (ancien et nouveau)
- [ ] Clés API récupérées pour les deux projets
- [ ] Backup de l'ancien projet créé (sécurité)

## 📦 Export Ancien Projet

### Base de Données
- [ ] Export SQL créé (via `pg_dump` ou Dashboard)
- [ ] Export sauvegardé dans un endroit sûr
- [ ] Vérification: Export contient schéma + données

### Storage
- [ ] Script `download-storage.js` exécuté
- [ ] Tous les fichiers téléchargés dans `storage-backup/`
- [ ] Vérification: Nombre de fichiers correspond

## 🚀 Import Nouveau Projet

### Base de Données
- [ ] Nouveau projet Supabase créé
- [ ] Import SQL exécuté (via `psql` ou Dashboard)
- [ ] Migrations appliquées (si nécessaire)
- [ ] Vérification: Toutes les tables existent
- [ ] Vérification: Nombre de lignes correspond
- [ ] Vérification: Indexes créés
- [ ] Vérification: RLS policies actives
- [ ] Vérification: Fonctions RPC fonctionnent

### Storage
- [ ] Bucket `produits-images` créé (public)
- [ ] Script `upload-storage.js` exécuté
- [ ] Tous les fichiers uploadés
- [ ] Vérification: Fichiers accessibles publiquement
- [ ] Test: Quelques images s'affichent correctement

### Realtime
- [ ] Realtime activé pour la table `commandes`
- [ ] Test: Abonnements fonctionnent

## 🔧 Configuration

### Variables d'Environnement Locales
- [ ] `.env.local` mis à jour avec nouvelles clés
- [ ] `NEXT_PUBLIC_SUPABASE_URL` mis à jour
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` mis à jour
- [ ] `SUPABASE_SERVICE_ROLE_KEY` mis à jour

### Variables Vercel
- [ ] Variables d'environnement mises à jour dans Vercel
- [ ] Redéploiement effectué
- [ ] Vérification: Nouveau déploiement utilise les nouvelles clés

## ✅ Tests

### Tests Locaux
- [ ] Application démarre sans erreur
- [ ] Produits s'affichent correctement
- [ ] Images des produits s'affichent
- [ ] Création de commande fonctionne
- [ ] Dashboard admin accessible
- [ ] Realtime notifications fonctionnent

### Tests Production
- [ ] Site en production fonctionne
- [ ] Produits s'affichent
- [ ] Images s'affichent
- [ ] Commandes peuvent être créées
- [ ] Admin dashboard fonctionne
- [ ] Emails envoyés correctement

## 🔒 Sécurité

- [ ] Anciennes clés API révoquées (après vérification)
- [ ] Nouveau projet sécurisé (RLS actif)
- [ ] Service role key protégé (jamais exposé côté client)
- [ ] Backup de l'ancien projet conservé (30 jours minimum)

## 📊 Post-Migration

- [ ] Monitoring activé sur le nouveau projet
- [ ] Logs vérifiés (pas d'erreurs)
- [ ] Performance vérifiée
- [ ] Documentation mise à jour
- [ ] Équipe informée du changement

---

**Date de migration:** _______________

**Responsable:** _______________

**Notes:** 
_________________________________________________
_________________________________________________
_________________________________________________

