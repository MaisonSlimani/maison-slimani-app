import type { Metadata } from 'next'
import CheckoutClient from './CheckoutClient'

export const metadata: Metadata = {
  title: 'Paiement - Maison Slimani',
  robots: {
    index: false,
    follow: false,
  },
}

/**
 * Checkout Page (RSC)
 * 
 * Server Component that provides declarative noindex metadata
 * and delegates the interactive checkout flow to CheckoutClient.
 */
export default function Page() {
  return <CheckoutClient />
}
