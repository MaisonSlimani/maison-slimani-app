# 🧪 Guide d'Utilisation - Suite de Tests QA Professionnelle

Cette suite de tests QA utilise **Playwright** pour détecter tous les bugs, erreurs et analyser les performances de votre site web, avec un focus spécial sur les performances mobiles.

## 🎯 Ce que fait la Suite QA

### 1. Détection d'Erreurs Complète
- ✅ **Erreurs Console:** Détecte toutes les erreurs JavaScript dans la console
- ✅ **Erreurs Réseau:** Identifie les requêtes HTTP échouées (404, 500, etc.)
- ✅ **Erreurs Runtime:** Capture les exceptions JavaScript non gérées
- ✅ **Erreurs de Chargement:** Détecte les ressources manquantes

### 2. Analyse de Performance (Focus Mobile)
- ✅ **Core Web Vitals:**
  - **LCP (Largest Contentful Paint):** Temps de chargement du contenu principal
  - **FCP (First Contentful Paint):** Temps jusqu'au premier rendu
  - **TBT (Total Blocking Time):** Temps de blocage total
  - **CLS (Cumulative Layout Shift):** Stabilité visuelle
- ✅ **Métriques de Taille:** Analyse la taille des ressources (images, scripts, CSS)
- ✅ **Requêtes Réseau:** Compte et analyse toutes les requêtes HTTP

### 3. Tests Fonctionnels
- ✅ **Liens Cassés:** Vérifie tous les liens internes
- ✅ **Images Manquantes:** Détecte les images qui ne se chargent pas
- ✅ **Formulaires:** Vérifie la validité et l'accessibilité des formulaires
- ✅ **Accessibilité:** Vérifie les problèmes d'accessibilité de base

### 4. Tests Mobile Spécialisés
- ✅ Simule un appareil mobile (iPhone SE - 375x667)
- ✅ Teste les performances sur réseau mobile
- ✅ Vérifie la responsivité
- ✅ Analyse les métriques spécifiques au mobile

## 📋 Prérequis

1. **Installer les dépendances:**
   ```bash
   npm install
   ```

2. **Installer Playwright:**
   ```bash
   npm run playwright:install
   ```

## 🚀 Utilisation

### Lancer les tests QA (Production)

La suite teste automatiquement votre site en production:
```bash
npm run qa:test
```

**URL testée par défaut:** `https://maison-slimani-experience.vercel.app`

### Tester un autre environnement

Pour tester un autre environnement (local ou staging), utilisez:
```bash
BASE_URL=http://localhost:3000 npm run qa:test
```

### Étape 3: Consulter le rapport

Le rapport détaillé sera généré dans le fichier `QA_REPORT.md` à la racine du projet.

## 📊 Comprendre le Rapport

### Core Web Vitals - Objectifs

#### Mobile (Priorité Critique)
- **LCP:** < 2,500ms ✅ (Excellent)
- **FCP:** < 1,800ms ✅ (Excellent)
- **TBT:** < 200ms ✅ (Excellent)
- **CLS:** < 0.1 ✅ (Excellent)

### Niveaux de Sévérité des Erreurs

- **🔴 Critique:** Erreurs qui empêchent le fonctionnement du site
- **🟠 Élevée:** Erreurs qui affectent significativement l'expérience utilisateur
- **🟡 Moyenne:** Avertissements et problèmes mineurs
- **🟢 Faible:** Suggestions d'amélioration

## 🎯 Recommandations de Performance Mobile

### Si LCP > 2,500ms
1. **Optimiser les images:**
   - Utiliser Next.js Image avec optimization
   - Convertir en WebP/AVIF
   - Implémenter le lazy loading
   - Précharger les images critiques

2. **Optimiser le CSS:**
   - Inline le CSS critique
   - Minimiser le CSS non utilisé
   - Utiliser le code splitting

3. **Optimiser le JavaScript:**
   - Réduire le bundle initial
   - Utiliser le code splitting par route
   - Déferrer les scripts non critiques

### Si FCP > 1,800ms
1. Réduire le CSS blocking
2. Optimiser les polices (font-display: swap)
3. Minimiser le JavaScript initial
4. Utiliser le preloading des ressources critiques

### Si TBT > 200ms
1. Réduire le JavaScript long
2. Utiliser React.lazy() pour les composants lourds
3. Déferrer les scripts non critiques
4. Optimiser les bundles

### Si CLS > 0.1
1. Définir width/height sur toutes les images
2. Utiliser des placeholders
3. Éviter les insertions dynamiques de contenu
4. Réserver l'espace pour les embeds

## ⚙️ Configuration

Par défaut, la suite teste la production: `https://maison-slimani-experience.vercel.app`

Pour tester un autre environnement, utilisez:
```bash
BASE_URL=http://localhost:3000 npm run qa:test
```

## 📝 Pages Testées

La suite teste automatiquement:
- ✅ Page d'accueil
- ✅ Boutique (toutes les catégories)
- ✅ Pages de produits
- ✅ Contact
- ✅ La Maison
- ✅ Panier
- ✅ Favoris
- ✅ Checkout
- ✅ Login
- ✅ Dashboard Admin
- ✅ Gestion Produits
- ✅ Gestion Commandes
- ✅ Paramètres

## 🔧 Personnalisation

Vous pouvez modifier le script `scripts/qa-test-suite.ts` pour:
- Ajouter des pages supplémentaires à tester
- Ajuster les seuils de performance
- Ajouter des tests personnalisés
- Modifier les critères d'accessibilité

## ❓ Problèmes Courants

**Erreur: "Browser not initialized"**
- Assurez-vous d'avoir installé Playwright: `npm run playwright:install`

**Erreur: "Navigation timeout"**
- Vérifiez que le site de production est accessible
- Certaines pages peuvent prendre plus de temps à charger
- Les pages admin peuvent nécessiter une authentification

**Pages non testées**
- Certaines pages peuvent nécessiter une authentification
- Vérifiez les logs pour voir quelles pages ont échoué

**Performances médiocres**
- Le rapport contient des recommandations détaillées
- Suivez les recommandations dans l'ordre de priorité

## 🎯 Objectif: Site Blazing Fast sur Mobile

Pour atteindre des performances optimales sur mobile:

1. **Priorité 1:** Optimiser le LCP (images, CSS, JS)
2. **Priorité 2:** Réduire le TBT (code splitting, déferrer)
3. **Priorité 3:** Éliminer le CLS (dimensions fixes)
4. **Priorité 4:** Améliorer le FCP (CSS critique, polices)

Le rapport vous indiquera exactement quelles pages ont besoin d'optimisation et comment les améliorer.

---

*Suite de tests QA professionnelle - Détection complète des bugs et analyse de performance*

