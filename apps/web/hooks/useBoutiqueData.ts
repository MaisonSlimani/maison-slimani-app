'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Product } from '@maison/domain'

interface CategoryItem { nom: string; slug: string; image_url?: string; description?: string }
interface CategoryWithImage { titre: string; tagline: string; image: string; lien: string }

export function useBoutiqueData(categorie: string, search: string) {
  const [categories, setCategories] = useState<{ nom: string; slug: string }[]>([])
  const [categoriesWithImages, setCategoriesWithImages] = useState<CategoryWithImage[]>([])
  const [selectedCategoryName, setSelectedCategoryName] = useState<string | null>(null)
  const [loadingCategories, setLoadingCategories] = useState(true)

  const { data: produits = [], isPending: loadingProducts } = useQuery<Product[]>({
    queryKey: ['produits', 'mobile', categorie, search, selectedCategoryName],
    staleTime: 2 * 60 * 1000,
    enabled: categorie !== 'tous' || !!search,
    queryFn: async ({ signal }) => {
      const q = new URLSearchParams()
      if (selectedCategoryName) q.set('categorie', selectedCategoryName)
      if (search) { q.set('search', search); q.set('useFullText', 'true') }
      const res = await fetch(`/api/produits?${q.toString()}`, { signal })
      return (await res.json())?.data || []
    },
  })

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/categories?active=true')
        const data: CategoryItem[] = (await res.json())?.data || []
        setCategories(data.map(c => ({ nom: c.nom, slug: c.slug })))
        setCategoriesWithImages(data.filter(c => c.image_url?.trim()).map(c => ({ titre: c.nom, tagline: c.description || '', image: c.image_url || '', lien: `/boutique/${c.slug}` })))
        setSelectedCategoryName(data.find(c => c.slug === categorie)?.nom || null)
      } catch (e) { console.error(e) } finally { setLoadingCategories(false) }
    })()
  }, [categorie])

  return { produits, loadingProducts, categories, categoriesWithImages, loadingCategories }
}
