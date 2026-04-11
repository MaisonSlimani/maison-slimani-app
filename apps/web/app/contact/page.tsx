import type { Metadata } from 'next'
import ContactClient from './ContactClient'

export const metadata: Metadata = {
    title: 'Contact - Maison Slimani | Chaussures Homme Luxe Maroc',
    description: 'Contactez Maison Slimani pour toute question sur nos chaussures, commandes ou livraisons. Notre équipe est à votre écoute pour un service premium.',
    openGraph: {
        title: 'Contact - Maison Slimani | Chaussures Homme Luxe Maroc',
        description: 'Contactez Maison Slimani pour toute question sur nos chaussures, commandes ou livraisons.',
        type: 'website',
    },
}

import { fetchSettingsData } from '../data/fetchSettings'

export default async function Page() {
    const settings = await fetchSettingsData()
    return <ContactClient initialSettings={settings} />
}
