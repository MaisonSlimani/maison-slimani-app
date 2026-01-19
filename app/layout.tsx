import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Suspense } from 'react'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { Providers } from '@/components/Providers'
import PWARedirect from '@/components/PWARedirect'
import NavigationWrapper from '@/components/NavigationWrapper'
import MetaPixel from '@/components/MetaPixel'
import { GoogleTagManagerHead, GoogleTagManagerBody } from '@/components/GoogleTagManager'
import { AnalyticsProvider } from '@/components/analytics-provider'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Maison Slimani - Chaussures Homme Luxe Maroc',
    template: '%s | Maison Slimani',
  },
  description: 'Maison Slimani : chaussures homme haut de gamme en cuir marocain. Qualité artisanale et savoir-faire d\'excellence. Livraison gratuite au Maroc. Retours sous 7 jours.',
  keywords: ['chaussures homme', 'luxe', 'Maroc', 'cuir', 'Maison Slimani', 'chaussures maroc', 'cuir marocain'],
  authors: [{ name: 'Maison Slimani' }],
  openGraph: {
    title: 'Maison Slimani - Chaussures Homme Luxe',
    description: 'Maison Slimani : chaussures homme haut de gamme en cuir marocain. Qualité artisanale et savoir-faire d\'excellence. Livraison gratuite au Maroc.',
    type: 'website',
    locale: 'fr_FR',
    siteName: 'Maison Slimani',
    images: [
      {
        url: 'https://www.maison-slimani.com/logo-search.png',
        width: 512,
        height: 512,
        alt: 'Maison Slimani Logo',
      },
      {
        url: 'https://www.maison-slimani.com/assets/hero-chaussures.jpg',
        width: 1200,
        height: 630,
        alt: 'Maison Slimani - Chaussures homme luxe',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Maison Slimani - Chaussures Homme Luxe',
    description: 'Maison Slimani : chaussures homme haut de gamme en cuir marocain. Qualité artisanale et savoir-faire d\'excellence.',
    images: ['https://www.maison-slimani.com/logo-search.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
  metadataBase: new URL('https://www.maison-slimani.com'),
  icons: {
    icon: '/favicon.ico',
    apple: '/icons/android-launchericon-192-192.png',
    shortcut: '/favicon.ico',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Maison Slimani',
  url: 'https://www.maison-slimani.com',
  logo: 'https://www.maison-slimani.com/logo-search.png',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const navigationSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    'itemListElement': [
      {
        '@type': 'SiteNavigationElement',
        'position': 1,
        'name': 'Boutique',
        'description': 'Tous nos produits',
        'url': 'https://www.maison-slimani.com/boutique'
      },
      {
        '@type': 'SiteNavigationElement',
        'position': 2,
        'name': 'La Maison',
        'description': 'Notre histoire et savoir-faire',
        'url': 'https://www.maison-slimani.com/maison'
      },
      {
        '@type': 'SiteNavigationElement',
        'position': 3,
        'name': 'Contact',
        'description': 'Contactez-nous',
        'url': 'https://www.maison-slimani.com/contact'
      }
    ]
  }

  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Preload hero image for faster LCP on mobile */}
        <link
          rel="preload"
          as="image"
          href="/assets/hero-chaussures.jpg"
          fetchPriority="high"
        />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icons/android-launchericon-192-192.png" />
        <meta name="theme-color" content="#D4AF37" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Maison Slimani" />
        {/* Facebook Domain Verification */}
        <meta name="facebook-domain-verification" content="ln1wiizsft23o3ned6y6lyafkjm5or" />
        <MetaPixel />
        <GoogleTagManagerHead />
      </head>
      <body className={`${inter.variable} ${playfair.variable} overflow-x-hidden max-w-full`} suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(navigationSchema) }}
        />
        <GoogleTagManagerBody />
        <Providers>
          <Suspense fallback={null}>
            <AnalyticsProvider>
              <PWARedirect />
              <NavigationWrapper>
                {children}
              </NavigationWrapper>
              <Toaster />
              <Sonner />
              <SpeedInsights />
            </AnalyticsProvider>
          </Suspense>
        </Providers>
      </body>
    </html>
  )
}
