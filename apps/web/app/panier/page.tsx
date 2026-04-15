import type { Metadata } from 'next'
import PanierClient from './PanierClient'

export const metadata: Metadata = {
  title: 'Votre Panier - Maison Slimani',
  robots: {
    index: false,
    follow: false,
  },
}

/**
 * Panier Page (RSC)
 * 
 * Server Component that provides declarative noindex metadata
 * and delegates the interactive cart logic to PanierClient.
 */
export default function Page() {
  return <PanierClient />
}
