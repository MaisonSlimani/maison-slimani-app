import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Maison Slimani - Chaussures Homme Luxe Maroc | Accueil',
    description: 'Maison Slimani : chaussures homme haut de gamme en cuir marocain. Qualité artisanale et savoir-faire d\'excellence. Collections exclusives confectionnées à la main. Livraison gratuite au Maroc. Retours sous 7 jours.',
    alternates: {
        canonical: '/',
    },
    openGraph: {
        title: 'Maison Slimani - Chaussures Homme Luxe Maroc | Accueil',
        description: 'Maison Slimani : chaussures homme haut de gamme en cuir marocain. Qualité artisanale et savoir-faire d\'excellence.',
        type: 'website',
        url: '/',
    },
}

import { Suspense } from 'react'
import { fetchHomeData } from './data/fetchHome'
import { HomeHero } from '@/components/home/HomeHero'
import HomeClientSection from './HomeClientSection' // New component to handle streamed data

export default async function Page() {
    // Start fetching but DON'T await it yet to unblock the Hero render
    const dataPromise = fetchHomeData()
    
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://maison-slimani.com'
    const jsonLd = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'Organization',
                '@id': `${siteUrl}/#organization`,
                name: 'Maison Slimani',
                url: siteUrl,
                logo: `${siteUrl}/logo-search.png`,
                sameAs: [
                    'https://www.instagram.com/maisonslimani/',
                    'https://www.facebook.com/maisonslimani/'
                ]
            },
            {
                '@type': 'WebSite',
                '@id': `${siteUrl}/#website`,
                url: siteUrl,
                name: 'Maison Slimani',
                description: 'Chaussures homme haut de gamme en cuir marocain. Qualité artisanale.'
            }
        ]
    }

    return (
        <main className="min-h-screen bg-ecru md:bg-white overflow-x-hidden">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            
            {/* 1. Above the fold: Renders instantly (Server Component) */}
            <HomeHero />

            {/* 2. Below the fold: Streamed via Suspense */}
            <Suspense fallback={<div className="min-h-[400px] animate-pulse bg-ecru/50" />}>
                <HomeClientSection dataPromise={dataPromise} />
            </Suspense>
        </main>
    )
}
