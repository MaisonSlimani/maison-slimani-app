import type { Metadata } from 'next'
import FAQClient from './FAQClient'
import { fetchFAQData } from '../data/fetchFAQ'

export const metadata: Metadata = {
    title: 'FAQ - Maison Slimani | Aide et Questions Fréquentes',
    description: 'Trouvez les réponses à vos questions sur Maison Slimani : commandes, livraisons, retours et entretien de vos chaussures de luxe au Maroc.',
    openGraph: {
        title: 'FAQ - Maison Slimani | Aide et Questions Fréquentes',
        description: 'Trouvez les réponses à vos questions sur Maison Slimani : commandes, livraisons, retours et entretien.',
        type: 'website',
    },
}

export default async function Page() {
    const settings = await fetchFAQData()
    return <FAQClient initialSettings={settings} />
}
