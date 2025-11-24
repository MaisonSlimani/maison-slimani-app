# 🎯 Guide d'Utilisation - Inspecteur de Prix

Ce système utilise **Playwright** pour inspecter automatiquement toutes les pages de votre site web et générer un rapport détaillé de prix basé sur le marché marocain.

## 📋 Prérequis

1. **Installer les dépendances:**
   ```bash
   npm install
   ```

2. **Installer Playwright (navigateur Chromium):**
   ```bash
   npm run playwright:install
   ```

## 🚀 Utilisation

### Étape 1: Démarrer le serveur de développement

Dans un premier terminal, démarrez votre application Next.js:
```bash
npm run dev
```

Le serveur doit être accessible sur `http://localhost:3000`

### Étape 2: Lancer l'inspection

Dans un deuxième terminal, lancez le script d'inspection:
```bash
npm run inspect:price
```

### Étape 3: Consulter le rapport

Le rapport sera généré dans le fichier `PRICING_REPORT.md` à la racine du projet.

## 📊 Ce que fait l'inspecteur

L'inspecteur va:

1. **Visiter toutes les pages** de votre site:
   - Pages publiques (accueil, boutique, contact, etc.)
   - Pages admin (dashboard, produits, commandes, etc.)
   - Pages de produits dynamiques

2. **Analyser chaque page** pour détecter:
   - Formulaires et validation
   - Animations (Framer Motion)
   - Mises à jour en temps réel (Supabase Realtime)
   - Authentification
   - Upload de fichiers
   - Recherche et filtres
   - Panier d'achat
   - Processus de commande
   - Optimisation SEO
   - Design responsive
   - Composants UI complexes

3. **Calculer les prix** basés sur:
   - Complexité de la page
   - Fonctionnalités détectées
   - Nombre de composants
   - Tarifs du marché marocain (MAD)

4. **Générer un rapport détaillé** avec:
   - Prix total estimé
   - Détail par page
   - Répartition par fonctionnalité
   - Statistiques globales
   - Tarifs de référence

## 💰 Tarifs de Référence (Marché Marocain)

Les tarifs utilisés sont basés sur le marché marocain:

- **Page Basique:** 2,000 MAD
- **Page Dynamique:** 3,500 MAD
- **Page Complexe:** 5,000 MAD
- **Authentification:** 4,000 MAD
- **Temps Réel:** 5,000 MAD
- **Tableau de Bord Admin:** 8,000 MAD
- **Processus de Commande:** 4,500 MAD
- **Et plus...**

## ⚙️ Configuration

Vous pouvez modifier l'URL de base en définissant une variable d'environnement:

```bash
BASE_URL=http://localhost:3000 npm run inspect:price
```

Ou pour un site en production:
```bash
BASE_URL=https://maisonslimani.com npm run inspect:price
```

## 📝 Notes Importantes

1. **Les pages nécessitant une authentification** peuvent ne pas être entièrement analysées si vous n'êtes pas connecté.

2. **Les prix sont des estimations** - la complexité réelle du code n'est pas toujours visible dans l'analyse automatique.

3. **Le script attend** que le serveur Next.js soit démarré avant de commencer l'inspection.

4. **Les pages dynamiques** (comme les pages de produits individuels) peuvent nécessiter des IDs valides pour être analysées.

## 🔧 Personnalisation

Vous pouvez modifier les tarifs dans le fichier `scripts/inspect-and-price.ts` dans la constante `PRICING_RATES` pour ajuster les prix selon vos besoins.

## ❓ Problèmes Courants

**Erreur: "Browser not initialized"**
- Assurez-vous d'avoir installé Playwright: `npm run playwright:install`

**Erreur: "Navigation timeout"**
- Vérifiez que le serveur Next.js est bien démarré
- Augmentez le timeout dans le script si nécessaire

**Pages non analysées**
- Certaines pages peuvent nécessiter une authentification
- Vérifiez les logs pour voir quelles pages ont échoué

---

*Généré automatiquement par le système d'inspection de prix*

