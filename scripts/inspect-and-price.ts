#!/usr/bin/env tsx
/**
 * Comprehensive Website Inspection and Pricing Report Generator
 * Analyzes all pages and generates detailed pricing based on Moroccan market rates
 */

import { chromium, Browser, Page } from 'playwright'
import * as fs from 'fs/promises'
import * as path from 'path'

// Moroccan Market Pricing Rates (in MAD - Moroccan Dirham)
const PRICING_RATES = {
  // Frontend Development
  basicPage: 2000,              // Simple static page
  dynamicPage: 3500,            // Page with data fetching
  complexPage: 5000,            // Page with multiple features
  
  // Components
  simpleComponent: 500,         // Basic UI component
  complexComponent: 1500,       // Component with logic
  animatedComponent: 2000,      // Component with animations
  formComponent: 2500,         // Form with validation
  dataTable: 3000,              // Data table with sorting/filtering
  
  // Features
  authentication: 4000,         // Auth system
  realTimeUpdates: 5000,        // Real-time features (WebSockets, Supabase realtime)
  paymentIntegration: 6000,     // Payment gateway
  emailSystem: 3000,            // Email sending system
  fileUpload: 2000,             // File upload functionality
  searchFilter: 2000,           // Search and filter
  cartSystem: 3500,             // Shopping cart
  checkoutFlow: 4500,          // Checkout process
  adminDashboard: 8000,         // Admin dashboard
  crudOperations: 3000,         // CRUD operations
  dataVisualization: 4000,      // Charts and graphs
  responsiveDesign: 2000,       // Mobile responsive
  seoOptimization: 2500,        // SEO features
  animations: 1500,             // Framer Motion animations
  imageOptimization: 1500,      // Image optimization
  
  // Backend/API
  apiEndpoint: 1500,            // Single API endpoint
  databaseSetup: 5000,          // Database schema and setup
  edgeFunction: 3000,           // Supabase Edge Function
  
  // Infrastructure
  deployment: 2000,             // Deployment setup
  ciCd: 3000,                   // CI/CD pipeline
  
  // Testing
  unitTests: 1000,              // Unit tests
  e2eTests: 2000,               // E2E tests
}

interface PageAnalysis {
  url: string
  title: string
  features: string[]
  components: string[]
  complexity: 'basic' | 'medium' | 'complex'
  estimatedPrice: number
  details: {
    hasForms: boolean
    hasAnimations: boolean
    hasRealTime: boolean
    hasDataFetching: boolean
    hasAuthentication: boolean
    hasFileUpload: boolean
    hasSearchFilter: boolean
    hasCart: boolean
    hasCheckout: boolean
    isAdmin: boolean
    isResponsive: boolean
    hasSeo: boolean
    imageCount: number
    linkCount: number
    formCount: number
    buttonCount: number
  }
}

class WebsiteInspector {
  private browser: Browser | null = null
  private baseUrl: string
  private pages: PageAnalysis[] = []
  
  constructor(baseUrl: string = 'http://localhost:3000') {
    this.baseUrl = baseUrl
  }
  
  async initialize() {
    console.log('🚀 Initializing Playwright browser...')
    this.browser = await chromium.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
  }
  
  async close() {
    if (this.browser) {
      await this.browser.close()
    }
  }
  
  async analyzePage(url: string): Promise<PageAnalysis> {
    if (!this.browser) throw new Error('Browser not initialized')
    
    console.log(`\n📄 Analyzing: ${url}`)
    const page = await this.browser.newPage()
    
    try {
      // Navigate to page
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 })
      await page.waitForTimeout(2000) // Wait for any dynamic content
      
      // Extract page information
      const title = await page.title()
      
      // Analyze page content
      const details = {
        hasForms: (await page.locator('form').count()) > 0,
        hasAnimations: await page.evaluate(() => {
          return document.querySelectorAll('[class*="motion"], [class*="animate"]').length > 0 ||
                 window.getComputedStyle(document.body).animationName !== 'none'
        }),
        hasRealTime: false, // Will be detected by checking for Supabase realtime subscriptions
        hasDataFetching: await page.evaluate(() => {
          return window.fetch !== undefined && 
                 (document.querySelectorAll('[data-supabase]').length > 0 ||
                  document.querySelectorAll('[class*="supabase"]').length > 0)
        }),
        hasAuthentication: url.includes('/login') || url.includes('/admin'),
        hasFileUpload: (await page.locator('input[type="file"]').count()) > 0,
        hasSearchFilter: (await page.locator('input[type="search"], [class*="search"], [class*="filter"]').count()) > 0,
        hasCart: url.includes('/panier') || url.includes('/cart'),
        hasCheckout: url.includes('/checkout'),
        isAdmin: url.includes('/admin'),
        isResponsive: await page.evaluate(() => {
          return window.matchMedia('(max-width: 768px)').matches !== undefined
        }),
        hasSeo: await page.evaluate(() => {
          return document.querySelector('meta[name="description"]') !== null ||
                 document.querySelector('script[type="application/ld+json"]') !== null
        }),
        imageCount: await page.locator('img').count(),
        linkCount: await page.locator('a[href]').count(),
        formCount: await page.locator('form').count(),
        buttonCount: await page.locator('button, [role="button"]').count(),
      }
      
      // Detect real-time features
      details.hasRealTime = await page.evaluate(() => {
        const scripts = Array.from(document.querySelectorAll('script'))
        return scripts.some(script => 
          script.textContent?.includes('supabase') && 
          (script.textContent.includes('channel') || script.textContent.includes('subscribe'))
        )
      })
      
      // Identify features
      const features: string[] = []
      const components: string[] = []
      
      if (details.hasForms) {
        features.push('Form Handling')
        components.push('Form Components')
        if (url.includes('/contact')) features.push('Contact Form')
        if (url.includes('/checkout')) features.push('Checkout Form')
      }
      
      if (details.hasAnimations) {
        features.push('Animations')
        components.push('Animated Components')
      }
      
      if (details.hasRealTime) {
        features.push('Real-time Updates')
      }
      
      if (details.hasDataFetching) {
        features.push('Data Fetching')
        if (url.includes('/boutique') || url.includes('/produit')) {
          features.push('Product Catalog')
        }
        if (url.includes('/admin')) {
          features.push('Admin Dashboard')
          features.push('Data Visualization')
        }
      }
      
      if (details.hasAuthentication) {
        features.push('Authentication')
      }
      
      if (details.hasFileUpload) {
        features.push('File Upload')
      }
      
      if (details.hasSearchFilter) {
        features.push('Search & Filter')
      }
      
      if (details.hasCart) {
        features.push('Shopping Cart')
      }
      
      if (details.hasCheckout) {
        features.push('Checkout Flow')
      }
      
      if (details.isAdmin) {
        features.push('Admin Panel')
        features.push('CRUD Operations')
        if (url.includes('/admin/commandes')) features.push('Order Management')
        if (url.includes('/admin/produits')) features.push('Product Management')
      }
      
      if (details.hasSeo) {
        features.push('SEO Optimization')
      }
      
      if (details.isResponsive) {
        features.push('Responsive Design')
      }
      
      // Determine complexity
      let complexity: 'basic' | 'medium' | 'complex' = 'basic'
      const featureCount = features.length
      if (featureCount > 5 || details.isAdmin) {
        complexity = 'complex'
      } else if (featureCount > 2) {
        complexity = 'medium'
      }
      
      // Calculate estimated price
      let estimatedPrice = 0
      
      // Base page price
      if (complexity === 'complex') {
        estimatedPrice += PRICING_RATES.complexPage
      } else if (complexity === 'medium') {
        estimatedPrice += PRICING_RATES.dynamicPage
      } else {
        estimatedPrice += PRICING_RATES.basicPage
      }
      
      // Add feature prices
      if (details.hasForms) estimatedPrice += PRICING_RATES.formComponent
      if (details.hasAnimations) estimatedPrice += PRICING_RATES.animations
      if (details.hasRealTime) estimatedPrice += PRICING_RATES.realTimeUpdates
      if (details.hasAuthentication) estimatedPrice += PRICING_RATES.authentication
      if (details.hasFileUpload) estimatedPrice += PRICING_RATES.fileUpload
      if (details.hasSearchFilter) estimatedPrice += PRICING_RATES.searchFilter
      if (details.hasCart) estimatedPrice += PRICING_RATES.cartSystem
      if (details.hasCheckout) estimatedPrice += PRICING_RATES.checkoutFlow
      if (details.isAdmin) estimatedPrice += PRICING_RATES.adminDashboard
      if (details.hasSeo) estimatedPrice += PRICING_RATES.seoOptimization
      if (details.isResponsive) estimatedPrice += PRICING_RATES.responsiveDesign
      
      // Add component prices based on counts
      estimatedPrice += Math.floor(details.imageCount / 5) * PRICING_RATES.imageOptimization
      estimatedPrice += details.formCount * PRICING_RATES.formComponent
      
      const analysis: PageAnalysis = {
        url,
        title,
        features,
        components,
        complexity,
        estimatedPrice: Math.round(estimatedPrice),
        details
      }
      
      console.log(`   ✓ Found ${features.length} features, Complexity: ${complexity}, Price: ${estimatedPrice} MAD`)
      
      return analysis
      
    } catch (error) {
      console.error(`   ✗ Error analyzing ${url}:`, error)
      return {
        url,
        title: 'Error loading page',
        features: [],
        components: [],
        complexity: 'basic',
        estimatedPrice: 0,
        details: {
          hasForms: false,
          hasAnimations: false,
          hasRealTime: false,
          hasDataFetching: false,
          hasAuthentication: false,
          hasFileUpload: false,
          hasSearchFilter: false,
          hasCart: false,
          hasCheckout: false,
          isAdmin: false,
          isResponsive: false,
          hasSeo: false,
          imageCount: 0,
          linkCount: 0,
          formCount: 0,
          buttonCount: 0,
        }
      }
    } finally {
      await page.close()
    }
  }
  
  async inspectAllPages() {
    console.log('\n🔍 Starting comprehensive website inspection...\n')
    
    // Define all pages to inspect
    const pagesToInspect = [
      // Public pages
      '/',
      '/boutique',
      '/boutique/classiques',
      '/boutique/cuirs-exotiques',
      '/boutique/editions-limitees',
      '/boutique/nouveautes',
      '/boutique/tous',
      '/contact',
      '/maison',
      '/panier',
      '/favoris',
      '/checkout',
      '/login',
      
      // Admin pages (may require auth, but we'll try)
      '/admin',
      '/admin/produits',
      '/admin/commandes',
      '/admin/parametres',
    ]
    
    for (const pagePath of pagesToInspect) {
      const fullUrl = `${this.baseUrl}${pagePath}`
      const analysis = await this.analyzePage(fullUrl)
      this.pages.push(analysis)
    }
    
    // Try to get product pages from sitemap or try common patterns
    // For now, we'll analyze the product page structure
    try {
      const productPageUrl = `${this.baseUrl}/produit/1` // Try a sample product
      const productAnalysis = await this.analyzePage(productPageUrl)
      if (productAnalysis.title !== 'Error loading page') {
        this.pages.push(productAnalysis)
      }
    } catch (error) {
      console.log('   ⚠ Could not analyze product page (may require valid product ID)')
    }
  }
  
  getTotalPrice(): number {
    return this.pages.reduce((sum, page) => sum + page.estimatedPrice, 0)
  }
  
  generatePricingReport(): string {
    const totalPrice = this.getTotalPrice()
    
    // Group by category
    const publicPages = this.pages.filter(p => !p.details.isAdmin && !p.url.includes('/login'))
    const adminPages = this.pages.filter(p => p.details.isAdmin)
    const authPages = this.pages.filter(p => p.details.hasAuthentication)
    
    // Feature breakdown
    const allFeatures = new Set<string>()
    this.pages.forEach(page => {
      page.features.forEach(f => allFeatures.add(f))
    })
    
    // Calculate feature prices
    const featurePrices: Record<string, number> = {}
    allFeatures.forEach(feature => {
      featurePrices[feature] = this.pages
        .filter(p => p.features.includes(feature))
        .reduce((sum, p) => {
          // Estimate feature contribution (rough calculation)
          const basePrice = p.estimatedPrice / Math.max(p.features.length, 1)
          return sum + basePrice
        }, 0)
    })
    
    let report = `# 📊 RAPPORT DÉTAILLÉ DE PRIX - MAISON SLIMANI
# Analyse Complète du Site Web - Marché Marocain

**Date de génération:** ${new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Casablanca' })}
**Base URL:** ${this.baseUrl}

---

## 💰 RÉSUMÉ EXÉCUTIF

**Prix Total Estimé:** ${totalPrice.toLocaleString('fr-FR')} MAD
**Nombre de Pages Analysées:** ${this.pages.length}
**Pages Publiques:** ${publicPages.length}
**Pages Admin:** ${adminPages.length}

---

## 📑 DÉTAIL PAR PAGE

`
    
    // Public Pages
    report += `### 🌐 Pages Publiques\n\n`
    publicPages.forEach(page => {
      report += `#### ${page.title || page.url}\n`
      report += `- **URL:** ${page.url}\n`
      report += `- **Complexité:** ${page.complexity.toUpperCase()}\n`
      report += `- **Prix Estimé:** ${page.estimatedPrice.toLocaleString('fr-FR')} MAD\n`
      report += `- **Fonctionnalités:** ${page.features.join(', ') || 'Aucune'}\n`
      report += `- **Détails Techniques:**\n`
      report += `  - Images: ${page.details.imageCount}\n`
      report += `  - Liens: ${page.details.linkCount}\n`
      report += `  - Formulaires: ${page.details.formCount}\n`
      report += `  - Boutons: ${page.details.buttonCount}\n`
      report += `  - Animations: ${page.details.hasAnimations ? 'Oui' : 'Non'}\n`
      report += `  - SEO: ${page.details.hasSeo ? 'Oui' : 'Non'}\n`
      report += `  - Responsive: ${page.details.isResponsive ? 'Oui' : 'Non'}\n`
      report += `\n`
    })
    
    // Admin Pages
    if (adminPages.length > 0) {
      report += `### 🔐 Pages Administrateur\n\n`
      adminPages.forEach(page => {
        report += `#### ${page.title || page.url}\n`
        report += `- **URL:** ${page.url}\n`
        report += `- **Complexité:** ${page.complexity.toUpperCase()}\n`
        report += `- **Prix Estimé:** ${page.estimatedPrice.toLocaleString('fr-FR')} MAD\n`
        report += `- **Fonctionnalités:** ${page.features.join(', ') || 'Aucune'}\n`
        report += `\n`
      })
    }
    
    // Feature Breakdown
    report += `## 🎯 RÉPARTITION PAR FONCTIONNALITÉ\n\n`
    const sortedFeatures = Object.entries(featurePrices)
      .sort((a, b) => b[1] - a[1])
    
    sortedFeatures.forEach(([feature, price]) => {
      const pageCount = this.pages.filter(p => p.features.includes(feature)).length
      report += `### ${feature}\n`
      report += `- **Prix Total:** ${Math.round(price).toLocaleString('fr-FR')} MAD\n`
      report += `- **Pages Utilisées:** ${pageCount}\n`
      report += `\n`
    })
    
    // Pricing Breakdown
    report += `## 💵 DÉTAIL DES TARIFS (Marché Marocain)\n\n`
    report += `### Développement Frontend\n`
    report += `- Page Basique: ${PRICING_RATES.basicPage.toLocaleString('fr-FR')} MAD\n`
    report += `- Page Dynamique: ${PRICING_RATES.dynamicPage.toLocaleString('fr-FR')} MAD\n`
    report += `- Page Complexe: ${PRICING_RATES.complexPage.toLocaleString('fr-FR')} MAD\n`
    report += `\n`
    
    report += `### Composants\n`
    report += `- Composant Simple: ${PRICING_RATES.simpleComponent.toLocaleString('fr-FR')} MAD\n`
    report += `- Composant Complexe: ${PRICING_RATES.complexComponent.toLocaleString('fr-FR')} MAD\n`
    report += `- Composant Animé: ${PRICING_RATES.animatedComponent.toLocaleString('fr-FR')} MAD\n`
    report += `- Formulaire: ${PRICING_RATES.formComponent.toLocaleString('fr-FR')} MAD\n`
    report += `- Tableau de Données: ${PRICING_RATES.dataTable.toLocaleString('fr-FR')} MAD\n`
    report += `\n`
    
    report += `### Fonctionnalités Spéciales\n`
    report += `- Authentification: ${PRICING_RATES.authentication.toLocaleString('fr-FR')} MAD\n`
    report += `- Mises à Jour en Temps Réel: ${PRICING_RATES.realTimeUpdates.toLocaleString('fr-FR')} MAD\n`
    report += `- Intégration Paiement: ${PRICING_RATES.paymentIntegration.toLocaleString('fr-FR')} MAD\n`
    report += `- Système d'Email: ${PRICING_RATES.emailSystem.toLocaleString('fr-FR')} MAD\n`
    report += `- Upload de Fichiers: ${PRICING_RATES.fileUpload.toLocaleString('fr-FR')} MAD\n`
    report += `- Recherche & Filtres: ${PRICING_RATES.searchFilter.toLocaleString('fr-FR')} MAD\n`
    report += `- Panier d'Achat: ${PRICING_RATES.cartSystem.toLocaleString('fr-FR')} MAD\n`
    report += `- Processus de Commande: ${PRICING_RATES.checkoutFlow.toLocaleString('fr-FR')} MAD\n`
    report += `- Tableau de Bord Admin: ${PRICING_RATES.adminDashboard.toLocaleString('fr-FR')} MAD\n`
    report += `- Opérations CRUD: ${PRICING_RATES.crudOperations.toLocaleString('fr-FR')} MAD\n`
    report += `- Visualisation de Données: ${PRICING_RATES.dataVisualization.toLocaleString('fr-FR')} MAD\n`
    report += `- Design Responsive: ${PRICING_RATES.responsiveDesign.toLocaleString('fr-FR')} MAD\n`
    report += `- Optimisation SEO: ${PRICING_RATES.seoOptimization.toLocaleString('fr-FR')} MAD\n`
    report += `- Animations: ${PRICING_RATES.animations.toLocaleString('fr-FR')} MAD\n`
    report += `- Optimisation d'Images: ${PRICING_RATES.imageOptimization.toLocaleString('fr-FR')} MAD\n`
    report += `\n`
    
    report += `### Backend/API\n`
    report += `- Point d'Accès API: ${PRICING_RATES.apiEndpoint.toLocaleString('fr-FR')} MAD\n`
    report += `- Configuration Base de Données: ${PRICING_RATES.databaseSetup.toLocaleString('fr-FR')} MAD\n`
    report += `- Edge Function: ${PRICING_RATES.edgeFunction.toLocaleString('fr-FR')} MAD\n`
    report += `\n`
    
    // Statistics
    report += `## 📈 STATISTIQUES GLOBALES\n\n`
    const totalImages = this.pages.reduce((sum, p) => sum + p.details.imageCount, 0)
    const totalLinks = this.pages.reduce((sum, p) => sum + p.details.linkCount, 0)
    const totalForms = this.pages.reduce((sum, p) => sum + p.details.formCount, 0)
    const totalButtons = this.pages.reduce((sum, p) => sum + p.details.buttonCount, 0)
    
    report += `- **Total Images:** ${totalImages}\n`
    report += `- **Total Liens:** ${totalLinks}\n`
    report += `- **Total Formulaires:** ${totalForms}\n`
    report += `- **Total Boutons:** ${totalButtons}\n`
    report += `- **Pages avec Animations:** ${this.pages.filter(p => p.details.hasAnimations).length}\n`
    report += `- **Pages avec SEO:** ${this.pages.filter(p => p.details.hasSeo).length}\n`
    report += `- **Pages Responsive:** ${this.pages.filter(p => p.details.isResponsive).length}\n`
    report += `- **Pages avec Temps Réel:** ${this.pages.filter(p => p.details.hasRealTime).length}\n`
    report += `\n`
    
    report += `## 📝 NOTES IMPORTANTES\n\n`
    report += `1. **Ces prix sont des estimations** basées sur les tarifs du marché marocain pour le développement web.\n`
    report += `2. Les prix peuvent varier selon:\n`
    report += `   - L'expérience du développeur\n`
    report += `   - La complexité réelle du code (non visible dans l'analyse)\n`
    report += `   - Les intégrations tierces\n`
    report += `   - Les optimisations de performance\n`
    report += `3. **Prix en MAD (Dirham Marocain)**\n`
    report += `4. Les pages nécessitant une authentification peuvent ne pas être entièrement analysées.\n`
    report += `\n`
    
    report += `---\n`
    report += `*Rapport généré automatiquement par Playwright Website Inspector*\n`
    
    return report
  }
  
  async saveReport(report: string) {
    const reportPath = path.join(process.cwd(), 'PRICING_REPORT.md')
    await fs.writeFile(reportPath, report, 'utf-8')
    console.log(`\n✅ Rapport sauvegardé dans: ${reportPath}`)
  }
}

// Main execution
async function main() {
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000'
  console.log(`\n🌍 Inspection du site: ${baseUrl}\n`)
  console.log('⚠️  Assurez-vous que le serveur Next.js est en cours d\'exécution (npm run dev)\n')
  
  const inspector = new WebsiteInspector(baseUrl)
  
  try {
    await inspector.initialize()
    await inspector.inspectAllPages()
    
    const report = inspector.generatePricingReport()
    await inspector.saveReport(report)
    
    console.log('\n✨ Inspection terminée avec succès!')
    console.log(`📊 Prix total estimé: ${inspector.getTotalPrice().toLocaleString('fr-FR')} MAD\n`)
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'inspection:', error)
    process.exit(1)
  } finally {
    await inspector.close()
  }
}

main()

