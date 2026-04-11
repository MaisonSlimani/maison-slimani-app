import type { Metadata } from 'next'
import MaisonClient from './MaisonClient'

export const metadata: Metadata = {
  title: 'Notre Maison - Maison Slimani | L\'Excellence de l\'Artisanat Marocain',
  description: 'Découvrez l\'histoire et les valeurs de Maison Slimani, marque marocaine de chaussures homme haut de gamme. Un héritage entre tradition et modernité.',
  openGraph: {
    title: 'Notre Maison - Maison Slimani | L\'Excellence de l\'Artisanat Marocain',
    description: 'Découvrez l\'histoire et les valeurs de Maison Slimani, marque marocaine de chaussures homme haut de gamme.',
    type: 'website',
  },
}

/**
 * Maison Page (RSC)
 * 
 * Server Component providing SEO metadata and loading the client-side storytelling view.
 */
export default function Page() {
  return <MaisonClient />
}
