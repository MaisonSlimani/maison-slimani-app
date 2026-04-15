import type { Metadata } from 'next'
import CategoriePage from './CategoriePage'

type Props = {
    params: Promise<{ categorie: string }>
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

import { fetchCategoryData } from '../../data/fetchCategory'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { categorie: categorySlug } = await params

    // Handle "tous" case
    if (categorySlug === 'tous') {
        return {
            title: 'Toutes nos chaussures - Collection complète | Maison Slimani',
            description: 'Découvrez toute notre collection de chaussures homme haut de gamme. Cuir marocain de qualité supérieure, artisanat d\'excellence. Livraison gratuite au Maroc.',
            openGraph: {
                title: 'Toutes nos chaussures - Maison Slimani',
                description: 'Collection complète de chaussures homme luxe en cuir marocain',
                type: 'website',
            }
        }
    }

    try {
        const data = await fetchCategoryData(categorySlug)
        const category = data?.category

        if (!category) {
            // Fallback if category not found
            return {
                title: 'Collection - Chaussures Homme | Maison Slimani',
                description: 'Découvrez notre collection de chaussures homme haut de gamme en cuir marocain. Qualité artisanale et savoir-faire d\'excellence.',
            }
        }

        const title = category.name || 'Collection'
        const categoryDescription = category.description || ''
        const description = categoryDescription
            ? `${categoryDescription} Découvrez notre collection ${title} de chaussures homme. Cuir marocain haut de gamme. Livraison gratuite.`
            : `Collection ${title} - Chaussures homme haut de gamme en cuir marocain. Artisanat d'excellence. Livraison gratuite au Maroc.`

        return {
            title: `${title} - Chaussures Homme Luxe | Maison Slimani`,
            description,
            openGraph: {
                title: `${title} - Maison Slimani`,
                description,
                type: 'website',
                images: category.image_url ? [
                    {
                        url: category.image_url,
                        width: 1200,
                        height: 630,
                        alt: `Collection ${title}`,
                    }
                ] : [],
            }
        }
    } catch (error) {
        console.error('Error generating category metadata:', error)

        // Fallback metadata
        return {
            title: 'Collection - Chaussures Homme | Maison Slimani',
            description: 'Découvrez notre collection de chaussures homme haut de gamme en cuir marocain. Qualité artisanale et savoir-faire d\'excellence.',
        }
    }
}

export default async function Page({ params }: Props) {
    const { categorie: categorySlug } = await params
    const initialData = await fetchCategoryData(categorySlug)
    return <CategoriePage initialData={initialData} />
}
