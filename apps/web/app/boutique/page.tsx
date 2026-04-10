import type { Metadata } from 'next'
import BoutiquePage from './BoutiquePage'

export const metadata: Metadata = {
  title: 'Collections - Chaussures Homme Luxe Maroc | Maison Slimani',
  description: 'Découvrez nos collections exclusives de chaussures homme haut de gamme : sneakers, classiques, mocassins. Cuir marocain de qualité supérieure. Livraison gratuite au Maroc.',
  openGraph: {
    title: 'Collections - Chaussures Homme | Maison Slimani',
    description: 'Découvrez nos collections exclusives de chaussures homme : sneakers, classiques, mocassins. Cuir marocain de qualité supérieure.',
    type: 'website',
  }
}

export default function Page() {
  return <BoutiquePage />
}
