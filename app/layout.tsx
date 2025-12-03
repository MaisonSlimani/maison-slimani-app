import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { Providers } from '@/components/Providers'
import PWARedirect from '@/components/PWARedirect'
import NavigationWrapper from '@/components/NavigationWrapper'
import MetaPixel from '@/components/MetaPixel'

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
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://maisonslimani.com'}/assets/hero-chaussures.jpg`,
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
    images: [`${process.env.NEXT_PUBLIC_SITE_URL || 'https://maisonslimani.com'}/assets/hero-chaussures.jpg`],
  },
  robots: {
    index: true,
    follow: true,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://maisonslimani.com'),
  icons: {
    icon: '/favicon.ico',
    apple: '/icons/android-launchericon-192-192.png',
    shortcut: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icons/android-launchericon-192-192.png" />
        <meta name="theme-color" content="#D4AF37" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Maison Slimani" />
      </head>
      <body className={`${inter.variable} ${playfair.variable} overflow-x-hidden max-w-full`} suppressHydrationWarning>
        <Providers>
          <MetaPixel />
          <PWARedirect />
          <NavigationWrapper>
            {children}
          </NavigationWrapper>
          <Toaster />
          <Sonner />
          <SpeedInsights />
        </Providers>
      </body>
    </html>
  )
}
