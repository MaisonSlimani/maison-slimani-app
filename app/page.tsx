import type { Metadata } from 'next'
import HomeClient from './HomeClient'

export const metadata: Metadata = {
    title: 'Maison Slimani - Chaussures Homme Luxe Maroc | Accueil',
    description: 'Maison Slimani : chaussures homme haut de gamme en cuir marocain. Qualité artisanale et savoir-faire d\'excellence. Collections exclusives confectionnées à la main. Livraison gratuite au Maroc. Retours sous 7 jours.',
    openGraph: {
        title: 'Maison Slimani - Chaussures Homme Luxe Maroc | Accueil',
        description: 'Maison Slimani : chaussures homme haut de gamme en cuir marocain. Qualité artisanale et savoir-faire d\'excellence.',
        type: 'website',
    },
}

export default function Page() {
    return <HomeClient />
}
