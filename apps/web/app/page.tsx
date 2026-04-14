import type { Metadata } from 'next'
import HomeClient from './HomeClient'

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

import { fetchHomeData } from './data/fetchHome'

export default async function Page() {
    const data = await fetchHomeData()
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
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <HomeClient initialData={data} />
        </>
    )
}
