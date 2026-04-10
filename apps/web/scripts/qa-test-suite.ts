#!/usr/bin/env tsx
/**
 * Professional QA Testing Suite
 * Comprehensive bug detection, error analysis, and performance testing
 * Special focus on mobile performance
 */

import { chromium, Browser, Page, BrowserContext } from 'playwright'
import * as fs from 'fs/promises'
import * as path from 'path'

interface ErrorReport {
  type: 'console' | 'network' | 'runtime' | 'accessibility' | 'performance'
  severity: 'critical' | 'high' | 'medium' | 'low'
  message: string
  url: string
  details?: any
  stack?: string
}

interface PerformanceMetrics {
  url: string
  device: 'desktop' | 'mobile'
  loadTime: number
  firstContentfulPaint: number
  largestContentfulPaint: number
  timeToInteractive: number
  totalBlockingTime: number
  cumulativeLayoutShift: number
  speedIndex: number
  totalSize: number
  imageSize: number
  scriptSize: number
  cssSize: number
  networkRequests: number
  failedRequests: number
  lighthouseScore?: {
    performance: number
    accessibility: number
    bestPractices: number
    seo: number
  }
}

interface PageTestResult {
  url: string
  status: 'passed' | 'failed' | 'warning'
  errors: ErrorReport[]
  performance: {
    desktop: PerformanceMetrics | null
    mobile: PerformanceMetrics | null
  }
  functionality: {
    brokenLinks: string[]
    missingImages: string[]
    formIssues: string[]
    accessibilityIssues: string[]
  }
  loadTime: number
  screenshot?: string
}

class QATestSuite {
  private browser: Browser | null = null
  private baseUrl: string
  private results: PageTestResult[] = []
  private allErrors: ErrorReport[] = []
  
  constructor(baseUrl: string = 'https://maison-slimani-experience.vercel.app') {
    this.baseUrl = baseUrl
  }
  
  async initialize() {
    console.log('🚀 Initializing QA Test Suite...')
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
  
  getAllErrors(): ErrorReport[] {
    return this.allErrors
  }
  
  async testPage(url: string): Promise<PageTestResult> {
    if (!this.browser) throw new Error('Browser not initialized')
    
    console.log(`\n🔍 Testing: ${url}`)
    
    const result: PageTestResult = {
      url,
      status: 'passed',
      errors: [],
      performance: {
        desktop: null,
        mobile: null
      },
      functionality: {
        brokenLinks: [],
        missingImages: [],
        formIssues: [],
        accessibilityIssues: []
      },
      loadTime: 0
    }
    
    // Test Desktop Performance
    console.log('   📊 Testing desktop performance...')
    result.performance.desktop = await this.testPerformance(url, 'desktop')
    
    // Test Mobile Performance (critical!)
    console.log('   📱 Testing mobile performance...')
    result.performance.mobile = await this.testPerformance(url, 'mobile')
    
    // Test Functionality
    console.log('   🔧 Testing functionality...')
    await this.testFunctionality(url, result)
    
    // Collect errors
    result.errors = this.allErrors.filter(e => e.url === url)
    
    // Determine status
    if (result.errors.some(e => e.severity === 'critical' || e.severity === 'high')) {
      result.status = 'failed'
    } else if (result.errors.length > 0 || result.functionality.brokenLinks.length > 0) {
      result.status = 'warning'
    }
    
    return result
  }
  
  async testPerformance(url: string, device: 'desktop' | 'mobile'): Promise<PerformanceMetrics | null> {
    if (!this.browser) return null
    
    const context = await this.browser.newContext({
      viewport: device === 'mobile' 
        ? { width: 375, height: 667 } // iPhone SE size
        : { width: 1920, height: 1080 },
      userAgent: device === 'mobile'
        ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
        : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      deviceScaleFactor: device === 'mobile' ? 2 : 1,
      isMobile: device === 'mobile',
      hasTouch: device === 'mobile'
    })
    
    const page = await context.newPage()
    const errors: ErrorReport[] = []
    const networkErrors: string[] = []
    let loadTime = 0
    let totalSize = 0
    let imageSize = 0
    let scriptSize = 0
    let cssSize = 0
    let networkRequests = 0
    let failedRequests = 0
    
    // Track console errors
    page.on('console', msg => {
      const type = msg.type()
      if (type === 'error' || type === 'warning') {
        errors.push({
          type: 'console',
          severity: type === 'error' ? 'high' : 'medium',
          message: msg.text(),
          url,
          stack: msg.location().url
        })
      }
    })
    
    // Track page errors
    page.on('pageerror', error => {
      errors.push({
        type: 'runtime',
        severity: 'critical',
        message: error.message,
        url,
        stack: error.stack
      })
    })
    
    // Track network requests
    page.on('request', request => {
      networkRequests++
      const resourceType = request.resourceType()
      const url = request.url()
      
      // Check for failed resources
      if (url.includes('404') || url.includes('error')) {
        networkErrors.push(url)
      }
    })
    
    page.on('requestfailed', request => {
      failedRequests++
      networkErrors.push(request.url())
      errors.push({
        type: 'network',
        severity: 'high',
        message: `Failed to load: ${request.url()}`,
        url,
        details: {
          failure: request.failure()?.errorText,
          resourceType: request.resourceType()
        }
      })
    })
    
    page.on('response', response => {
      const headers = response.headers()
      const contentLength = parseInt(headers['content-length'] || '0', 10)
      totalSize += contentLength
      
      const resourceType = response.request().resourceType()
      if (resourceType === 'image') {
        imageSize += contentLength
      } else if (resourceType === 'script') {
        scriptSize += contentLength
      } else if (resourceType === 'stylesheet') {
        cssSize += contentLength
      }
      
      // Check for error status codes
      if (response.status() >= 400) {
        errors.push({
          type: 'network',
          severity: response.status() >= 500 ? 'critical' : 'high',
          message: `HTTP ${response.status()}: ${response.url()}`,
          url,
          details: {
            status: response.status(),
            statusText: response.statusText()
          }
        })
      }
    })
    
    try {
      // Start performance measurement
      const startTime = Date.now()
      
      // Navigate with performance API
      await page.goto(url, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      })
      
      // Wait for page to be fully interactive
      await page.waitForLoadState('domcontentloaded')
      await page.waitForTimeout(2000) // Wait for any lazy-loaded content
      
      loadTime = Date.now() - startTime
      
      // Get performance metrics using CDP
      const client = await context.newCDPSession(page)
      await client.send('Performance.enable')
      await client.send('Runtime.enable')
      
      // Get performance timing
      const performanceTiming = await page.evaluate(() => {
        const perf = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        const paint = performance.getEntriesByType('paint')
        const fcp = paint.find(p => p.name === 'first-contentful-paint')
        const lcp = performance.getEntriesByType('largest-contentful-paint')
        
        return {
          loadTime: perf.loadEventEnd - perf.fetchStart,
          domContentLoaded: perf.domContentLoadedEventEnd - perf.fetchStart,
          firstContentfulPaint: fcp ? fcp.startTime : 0,
          largestContentfulPaint: lcp.length > 0 ? lcp[lcp.length - 1].startTime : 0
        }
      })
      
      // Calculate Core Web Vitals
      const metrics = await page.evaluate(() => {
        return new Promise((resolve) => {
          // Measure CLS
          let clsValue = 0
          const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (!(entry as any).hadRecentInput) {
                clsValue += (entry as any).value
              }
            }
            resolve({ cls: clsValue })
          })
          observer.observe({ type: 'layout-shift', buffered: true })
          
          setTimeout(() => {
            observer.disconnect()
            resolve({ cls: clsValue })
          }, 3000)
        })
      })
      
      // Calculate TBT (Total Blocking Time) - simplified
      const tbt = await page.evaluate(() => {
        const longTasks = performance.getEntriesByType('longtask') as PerformanceEntry[]
        return longTasks.reduce((sum, task) => sum + (task.duration - 50), 0)
      })
      
      // Calculate Speed Index (simplified)
      const speedIndex = await this.calculateSpeedIndex(page)
      
      // Store errors
      this.allErrors.push(...errors)
      
      const perfMetrics: PerformanceMetrics = {
        url,
        device,
        loadTime: performanceTiming.loadTime,
        firstContentfulPaint: performanceTiming.firstContentfulPaint,
        largestContentfulPaint: performanceTiming.largestContentfulPaint || 0,
        timeToInteractive: performanceTiming.domContentLoaded,
        totalBlockingTime: tbt as number,
        cumulativeLayoutShift: (metrics as any).cls || 0,
        speedIndex: speedIndex,
        totalSize: Math.round(totalSize / 1024), // KB
        imageSize: Math.round(imageSize / 1024), // KB
        scriptSize: Math.round(scriptSize / 1024), // KB
        cssSize: Math.round(cssSize / 1024), // KB
        networkRequests,
        failedRequests
      }
      
      await context.close()
      return perfMetrics
      
    } catch (error: any) {
      errors.push({
        type: 'runtime',
        severity: 'critical',
        message: `Failed to load page: ${error.message}`,
        url,
        stack: error.stack
      })
      this.allErrors.push(...errors)
      await context.close()
      return null
    }
  }
  
  async calculateSpeedIndex(page: Page): Promise<number> {
    // Simplified Speed Index calculation
    // In production, you'd use a more sophisticated method
    try {
      const startTime = Date.now()
      await page.waitForLoadState('networkidle')
      const endTime = Date.now()
      return endTime - startTime
    } catch {
      return 0
    }
  }
  
  async testFunctionality(url: string, result: PageTestResult) {
    if (!this.browser) return
    
    const context = await this.browser.newContext({
      viewport: { width: 1920, height: 1080 }
    })
    const page = await context.newPage()
    
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 })
      await page.waitForTimeout(1000)
      
      // Test broken links
      const links = await page.locator('a[href]').all()
      for (const link of links.slice(0, 20)) { // Limit to first 20 links
        try {
          const href = await link.getAttribute('href')
          if (href && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
            const fullUrl = href.startsWith('http') ? href : new URL(href, url).href
            if (fullUrl.startsWith(this.baseUrl)) {
              const response = await page.request.get(fullUrl).catch(() => null)
              if (response && response.status() >= 400) {
                result.functionality.brokenLinks.push(fullUrl)
              }
            }
          }
        } catch (error) {
          // Link might be external or invalid
        }
      }
      
      // Test missing images
      const images = await page.locator('img').all()
      for (const img of images) {
        try {
          const src = await img.getAttribute('src')
          if (src && !src.startsWith('data:')) {
            const imgUrl = src.startsWith('http') ? src : new URL(src, url).href
            if (imgUrl.startsWith(this.baseUrl)) {
              const response = await page.request.head(imgUrl).catch(() => null)
              if (!response || response.status() >= 400) {
                result.functionality.missingImages.push(imgUrl)
              }
            }
          }
        } catch (error) {
          // Image might be external
        }
      }
      
      // Test forms
      const forms = await page.locator('form').all()
      for (const form of forms) {
        try {
          // Check for required fields without labels
          const requiredInputs = await form.locator('input[required], select[required], textarea[required]').all()
          for (const input of requiredInputs) {
            const id = await input.getAttribute('id')
            const name = await input.getAttribute('name')
            const label = id ? await page.locator(`label[for="${id}"]`).count() : 0
            
            if (!label && !name) {
              result.functionality.formIssues.push('Required field without label or name')
            }
          }
          
          // Check for submit buttons
          const submitButton = await form.locator('button[type="submit"], input[type="submit"]').count()
          if (submitButton === 0) {
            result.functionality.formIssues.push('Form without submit button')
          }
        } catch (error) {
          // Form might have issues
        }
      }
      
      // Basic accessibility checks
      // Check for missing alt text on images
      const imagesWithoutAlt = await page.locator('img:not([alt])').count()
      if (imagesWithoutAlt > 0) {
        result.functionality.accessibilityIssues.push(`${imagesWithoutAlt} images without alt text`)
      }
      
      // Check for missing headings hierarchy
      const h1Count = await page.locator('h1').count()
      if (h1Count === 0) {
        result.functionality.accessibilityIssues.push('Missing H1 heading')
      } else if (h1Count > 1) {
        result.functionality.accessibilityIssues.push('Multiple H1 headings found')
      }
      
      // Check for buttons without accessible names
      const buttons = await page.locator('button').all()
      for (const button of buttons.slice(0, 10)) {
        const text = await button.textContent()
        const ariaLabel = await button.getAttribute('aria-label')
        const ariaLabelledBy = await button.getAttribute('aria-labelledby')
        
        if (!text?.trim() && !ariaLabel && !ariaLabelledBy) {
          result.functionality.accessibilityIssues.push('Button without accessible name')
        }
      }
      
    } catch (error: any) {
      this.allErrors.push({
        type: 'runtime',
        severity: 'high',
        message: `Functionality test failed: ${error.message}`,
        url,
        stack: error.stack
      })
    } finally {
      await context.close()
    }
  }
  
  async runAllTests() {
    console.log('\n🧪 Starting Comprehensive QA Testing Suite...\n')
    
    const pagesToTest = [
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
      '/admin',
      '/admin/produits',
      '/admin/commandes',
      '/admin/parametres',
    ]
    
    for (const pagePath of pagesToTest) {
      const fullUrl = `${this.baseUrl}${pagePath}`
      try {
        const result = await this.testPage(fullUrl)
        this.results.push(result)
      } catch (error: any) {
        console.error(`   ❌ Failed to test ${fullUrl}:`, error.message)
        this.results.push({
          url: fullUrl,
          status: 'failed',
          errors: [{
            type: 'runtime',
            severity: 'critical',
            message: `Test failed: ${error.message}`,
            url: fullUrl
          }],
          performance: { desktop: null, mobile: null },
          functionality: {
            brokenLinks: [],
            missingImages: [],
            formIssues: [],
            accessibilityIssues: []
          },
          loadTime: 0
        })
      }
    }
  }
  
  generateReport(): string {
    const totalPages = this.results.length
    const passedPages = this.results.filter(r => r.status === 'passed').length
    const failedPages = this.results.filter(r => r.status === 'failed').length
    const warningPages = this.results.filter(r => r.status === 'warning').length
    
    const criticalErrors = this.allErrors.filter(e => e.severity === 'critical')
    const highErrors = this.allErrors.filter(e => e.severity === 'high')
    const mediumErrors = this.allErrors.filter(e => e.severity === 'medium')
    const lowErrors = this.allErrors.filter(e => e.severity === 'low')
    
    // Performance analysis
    const mobilePerfs = this.results
      .map(r => r.performance.mobile)
      .filter(p => p !== null) as PerformanceMetrics[]
    
    const desktopPerfs = this.results
      .map(r => r.performance.desktop)
      .filter(p => p !== null) as PerformanceMetrics[]
    
    const avgMobileLCP = mobilePerfs.length > 0
      ? mobilePerfs.reduce((sum, p) => sum + p.largestContentfulPaint, 0) / mobilePerfs.length
      : 0
    
    const avgMobileFCP = mobilePerfs.length > 0
      ? mobilePerfs.reduce((sum, p) => sum + p.firstContentfulPaint, 0) / mobilePerfs.length
      : 0
    
    const avgMobileTBT = mobilePerfs.length > 0
      ? mobilePerfs.reduce((sum, p) => sum + p.totalBlockingTime, 0) / mobilePerfs.length
      : 0
    
    const avgMobileCLS = mobilePerfs.length > 0
      ? mobilePerfs.reduce((sum, p) => sum + p.cumulativeLayoutShift, 0) / mobilePerfs.length
      : 0
    
    let report = `# 🐛 RAPPORT QA COMPLET - MAISON SLIMANI
# Analyse Professionnelle des Bugs, Erreurs et Performances

**Date de génération:** ${new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Casablanca' })}
**Base URL:** ${this.baseUrl}

---

## 📊 RÉSUMÉ EXÉCUTIF

### Statut Global
- **Pages Testées:** ${totalPages}
- **✅ Réussies:** ${passedPages} (${Math.round(passedPages/totalPages*100)}%)
- **❌ Échouées:** ${failedPages} (${Math.round(failedPages/totalPages*100)}%)
- **⚠️ Avertissements:** ${warningPages} (${Math.round(warningPages/totalPages*100)}%)

### Erreurs Détectées
- **🔴 Critiques:** ${criticalErrors.length}
- **🟠 Élevées:** ${highErrors.length}
- **🟡 Moyennes:** ${mediumErrors.length}
- **🟢 Faibles:** ${lowErrors.length}
- **Total:** ${this.allErrors.length}

---

## 📱 PERFORMANCE MOBILE (PRIORITÉ CRITIQUE)

### Core Web Vitals - Mobile

#### Largest Contentful Paint (LCP)
- **Moyenne:** ${avgMobileLCP.toFixed(0)}ms
- **Objectif:** < 2,500ms ✅
- **Statut:** ${avgMobileLCP < 2500 ? '✅ EXCELLENT' : avgMobileLCP < 4000 ? '⚠️ À AMÉLIORER' : '❌ CRITIQUE'}
- **Recommandation:** ${avgMobileLCP > 2500 ? 'Optimiser les images, utiliser le lazy loading, précharger les ressources critiques' : 'Performance optimale'}

#### First Contentful Paint (FCP)
- **Moyenne:** ${avgMobileFCP.toFixed(0)}ms
- **Objectif:** < 1,800ms ✅
- **Statut:** ${avgMobileFCP < 1800 ? '✅ EXCELLENT' : avgMobileFCP < 3000 ? '⚠️ À AMÉLIORER' : '❌ CRITIQUE'}
- **Recommandation:** ${avgMobileFCP > 1800 ? 'Réduire le CSS critique, optimiser les polices, minimiser le JavaScript initial' : 'Performance optimale'}

#### Total Blocking Time (TBT)
- **Moyenne:** ${avgMobileTBT.toFixed(0)}ms
- **Objectif:** < 200ms ✅
- **Statut:** ${avgMobileTBT < 200 ? '✅ EXCELLENT' : avgMobileTBT < 600 ? '⚠️ À AMÉLIORER' : '❌ CRITIQUE'}
- **Recommandation:** ${avgMobileTBT > 200 ? 'Réduire le JavaScript, utiliser le code splitting, déferrer les scripts non critiques' : 'Performance optimale'}

#### Cumulative Layout Shift (CLS)
- **Moyenne:** ${avgMobileCLS.toFixed(3)}
- **Objectif:** < 0.1 ✅
- **Statut:** ${avgMobileCLS < 0.1 ? '✅ EXCELLENT' : avgMobileCLS < 0.25 ? '⚠️ À AMÉLIORER' : '❌ CRITIQUE'}
- **Recommandation:** ${avgMobileCLS > 0.1 ? 'Définir les dimensions des images, éviter les insertions dynamiques de contenu, utiliser les placeholders' : 'Performance optimale'}

### Métriques de Performance Mobile par Page

`
    
    mobilePerfs.forEach(perf => {
      const lcpStatus = perf.largestContentfulPaint < 2500 ? '✅' : perf.largestContentfulPaint < 4000 ? '⚠️' : '❌'
      const fcpStatus = perf.firstContentfulPaint < 1800 ? '✅' : perf.firstContentfulPaint < 3000 ? '⚠️' : '❌'
      const tbtStatus = perf.totalBlockingTime < 200 ? '✅' : perf.totalBlockingTime < 600 ? '⚠️' : '❌'
      const clsStatus = perf.cumulativeLayoutShift < 0.1 ? '✅' : perf.cumulativeLayoutShift < 0.25 ? '⚠️' : '❌'
      
      report += `#### ${perf.url}\n`
      report += `- **LCP:** ${perf.largestContentfulPaint.toFixed(0)}ms ${lcpStatus}\n`
      report += `- **FCP:** ${perf.firstContentfulPaint.toFixed(0)}ms ${fcpStatus}\n`
      report += `- **TBT:** ${perf.totalBlockingTime.toFixed(0)}ms ${tbtStatus}\n`
      report += `- **CLS:** ${perf.cumulativeLayoutShift.toFixed(3)} ${clsStatus}\n`
      report += `- **Taille Totale:** ${perf.totalSize} KB\n`
      report += `- **Images:** ${perf.imageSize} KB\n`
      report += `- **Scripts:** ${perf.scriptSize} KB\n`
      report += `- **CSS:** ${perf.cssSize} KB\n`
      report += `- **Requêtes Réseau:** ${perf.networkRequests}\n`
      report += `- **Requêtes Échouées:** ${perf.failedRequests}\n`
      report += `\n`
    })
    
    // Desktop Performance Summary
    if (desktopPerfs.length > 0) {
      const avgDesktopLCP = desktopPerfs.reduce((sum, p) => sum + p.largestContentfulPaint, 0) / desktopPerfs.length
      report += `## 💻 PERFORMANCE DESKTOP\n\n`
      report += `- **LCP Moyen:** ${avgDesktopLCP.toFixed(0)}ms\n`
      report += `- **FCP Moyen:** ${desktopPerfs.reduce((sum, p) => sum + p.firstContentfulPaint, 0) / desktopPerfs.length}ms\n`
      report += `\n`
    }
    
    // Errors Section
    report += `## 🐛 ERREURS DÉTECTÉES\n\n`
    
    if (criticalErrors.length > 0) {
      report += `### 🔴 Erreurs Critiques (${criticalErrors.length})\n\n`
      criticalErrors.forEach((error, index) => {
        report += `#### ${index + 1}. ${error.type.toUpperCase()} - ${error.url}\n`
        report += `**Message:** ${error.message}\n`
        if (error.stack) {
          report += `**Stack:**\n\`\`\`\n${error.stack}\n\`\`\`\n`
        }
        if (error.details) {
          report += `**Détails:** ${JSON.stringify(error.details, null, 2)}\n`
        }
        report += `\n`
      })
    }
    
    if (highErrors.length > 0) {
      report += `### 🟠 Erreurs Élevées (${highErrors.length})\n\n`
      highErrors.slice(0, 20).forEach((error, index) => {
        report += `${index + 1}. **${error.type}** - ${error.url}: ${error.message}\n`
      })
      if (highErrors.length > 20) {
        report += `\n*... et ${highErrors.length - 20} autres erreurs*\n`
      }
      report += `\n`
    }
    
    // Functionality Issues
    report += `## 🔧 PROBLÈMES FONCTIONNELS\n\n`
    
    const allBrokenLinks = this.results.flatMap(r => r.functionality.brokenLinks)
    const allMissingImages = this.results.flatMap(r => r.functionality.missingImages)
    const allFormIssues = this.results.flatMap(r => r.functionality.formIssues)
    const allAccessibilityIssues = this.results.flatMap(r => r.functionality.accessibilityIssues)
    
    if (allBrokenLinks.length > 0) {
      report += `### Liens Cassés (${allBrokenLinks.length})\n\n`
      allBrokenLinks.slice(0, 10).forEach(link => {
        report += `- ${link}\n`
      })
      if (allBrokenLinks.length > 10) {
        report += `\n*... et ${allBrokenLinks.length - 10} autres liens cassés*\n`
      }
      report += `\n`
    }
    
    if (allMissingImages.length > 0) {
      report += `### Images Manquantes (${allMissingImages.length})\n\n`
      allMissingImages.slice(0, 10).forEach(img => {
        report += `- ${img}\n`
      })
      if (allMissingImages.length > 10) {
        report += `\n*... et ${allMissingImages.length - 10} autres images manquantes*\n`
      }
      report += `\n`
    }
    
    if (allFormIssues.length > 0) {
      report += `### Problèmes de Formulaires (${allFormIssues.length})\n\n`
      allFormIssues.forEach(issue => {
        report += `- ${issue}\n`
      })
      report += `\n`
    }
    
    if (allAccessibilityIssues.length > 0) {
      report += `### Problèmes d'Accessibilité (${allAccessibilityIssues.length})\n\n`
      allAccessibilityIssues.forEach(issue => {
        report += `- ${issue}\n`
      })
      report += `\n`
    }
    
    // Detailed Page Results
    report += `## 📄 DÉTAIL PAR PAGE\n\n`
    
    this.results.forEach(result => {
      const statusIcon = result.status === 'passed' ? '✅' : result.status === 'failed' ? '❌' : '⚠️'
      report += `### ${statusIcon} ${result.url}\n\n`
      report += `**Statut:** ${result.status.toUpperCase()}\n`
      
      if (result.performance.mobile) {
        const perf = result.performance.mobile
        report += `**Performance Mobile:**\n`
        report += `- LCP: ${perf.largestContentfulPaint.toFixed(0)}ms\n`
        report += `- FCP: ${perf.firstContentfulPaint.toFixed(0)}ms\n`
        report += `- TBT: ${perf.totalBlockingTime.toFixed(0)}ms\n`
        report += `- CLS: ${perf.cumulativeLayoutShift.toFixed(3)}\n`
        report += `- Taille: ${perf.totalSize} KB\n`
      }
      
      if (result.errors.length > 0) {
        report += `**Erreurs:** ${result.errors.length}\n`
      }
      
      if (result.functionality.brokenLinks.length > 0) {
        report += `**Liens Cassés:** ${result.functionality.brokenLinks.length}\n`
      }
      
      if (result.functionality.missingImages.length > 0) {
        report += `**Images Manquantes:** ${result.functionality.missingImages.length}\n`
      }
      
      report += `\n`
    })
    
    // Recommendations
    report += `## 🎯 RECOMMANDATIONS PRIORITAIRES\n\n`
    
    if (avgMobileLCP > 2500) {
      report += `### 1. Optimiser le LCP Mobile (CRITIQUE)\n`
      report += `- Utiliser Next.js Image avec optimization automatique\n`
      report += `- Implémenter le lazy loading pour les images below-the-fold\n`
      report += `- Précharger les ressources critiques (fonts, CSS)\n`
      report += `- Utiliser WebP/AVIF pour les images\n`
      report += `- Minimiser le CSS et JavaScript initial\n`
      report += `\n`
    }
    
    if (avgMobileFCP > 1800) {
      report += `### 2. Améliorer le First Contentful Paint\n`
      report += `- Inline le CSS critique\n`
      report += `- Utiliser font-display: swap pour les polices\n`
      report += `- Réduire le JavaScript blocking\n`
      report += `- Optimiser le rendu initial\n`
      report += `\n`
    }
    
    if (avgMobileTBT > 200) {
      report += `### 3. Réduire le Total Blocking Time\n`
      report += `- Code splitting par route\n`
      report += `- Déferrer les scripts non critiques\n`
      report += `- Optimiser les bundles JavaScript\n`
      report += `- Utiliser React.lazy() pour les composants lourds\n`
      report += `\n`
    }
    
    if (avgMobileCLS > 0.1) {
      report += `### 4. Éliminer le Layout Shift\n`
      report += `- Définir width/height sur toutes les images\n`
      report += `- Utiliser des placeholders pour les images\n`
      report += `- Éviter les insertions dynamiques de contenu\n`
      report += `- Réserver l'espace pour les publicités/embeds\n`
      report += `\n`
    }
    
    if (criticalErrors.length > 0) {
      report += `### 5. Corriger les Erreurs Critiques\n`
      report += `- ${criticalErrors.length} erreur(s) critique(s) détectée(s)\n`
      report += `- Voir la section "Erreurs Détectées" ci-dessus\n`
      report += `\n`
    }
    
    report += `---\n`
    report += `*Rapport généré automatiquement par le QA Test Suite*\n`
    
    return report
  }
  
  async saveReport(report: string) {
    const reportPath = path.join(process.cwd(), 'QA_REPORT.md')
    await fs.writeFile(reportPath, report, 'utf-8')
    console.log(`\n✅ Rapport QA sauvegardé dans: ${reportPath}`)
  }
}

// Main execution
async function main() {
  const baseUrl = process.env.BASE_URL || 'https://maison-slimani-experience.vercel.app'
  console.log(`\n🧪 QA Test Suite - Testing: ${baseUrl}\n`)
  console.log('🌐 Test de la version PRODUCTION\n')
  
  const qaSuite = new QATestSuite(baseUrl)
  
  try {
    await qaSuite.initialize()
    await qaSuite.runAllTests()
    
    const report = qaSuite.generateReport()
    await qaSuite.saveReport(report)
    
    const allErrors = qaSuite.getAllErrors()
    const totalErrors = allErrors.length
    const criticalErrors = allErrors.filter(e => e.severity === 'critical').length
    
    console.log('\n✨ Tests terminés!')
    console.log(`📊 Total d'erreurs détectées: ${totalErrors}`)
    console.log(`🔴 Erreurs critiques: ${criticalErrors}`)
    console.log(`📄 Rapport sauvegardé dans QA_REPORT.md\n`)
    
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error)
    process.exit(1)
  } finally {
    await qaSuite.close()
  }
}

main()

