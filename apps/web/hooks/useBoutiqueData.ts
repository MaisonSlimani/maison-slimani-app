'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Product, Category } from '@maison/domain'
import { apiFetch, ENDPOINTS } from '@/lib/api/client'

interface CategoryWithImage { titre: string; tagline: string; image: string; lien: string }

export function useBoutiqueData(categorie: string, search: string, initialCategories?: Category[]) {
  const [categories, setCategories] = useState<{ nom: string; slug: string }[]>(() => {
    if (!initialCategories) return []
    return initialCategories.map(c => ({ nom: c.nom, slug: c.slug }))
  })
  const [categoriesWithImages, setCategoriesWithImages] = useState<CategoryWithImage[]>(() => {
    if (!initialCategories) return []
    return initialCategories
      .filter(c => c.image_url?.trim())
      .map(c => ({ titre: c.nom, tagline: c.description || '', image: c.image_url || '', lien: `/boutique/${c.slug}` }))
  })
  const [selectedCategoryName, setSelectedCategoryName] = useState<string | null>(() => {
    if (!initialCategories) return null
    return initialCategories.find(c => c.slug === categorie)?.nom || null
  })
  const [loadingCategories, setLoadingCategories] = useState(!initialCategories)

  const { data: produits = [], isPending: loadingProducts } = useQuery<Product[]>({
    queryKey: ['produits', 'mobile', categorie, search, selectedCategoryName],
    staleTime: 2 * 60 * 1000,
    enabled: categorie !== 'tous' || !!search,
    queryFn: async ({ signal }) => {
      const q = new URLSearchParams()
      if (selectedCategoryName) q.set('categorie', selectedCategoryName)
      if (search) { q.set('search', search); q.set('useFullText', 'true') }
      const result = await apiFetch<Product[]>(`${ENDPOINTS.PRODUITS}?${q.toString()}`, { signal })
      return result.data || []
    },
  })

  useEffect(() => {
    if (initialCategories && categories.length > 0 && selectedCategoryName) return

    (async () => {
      try {
        const result = await apiFetch<Category[]>(`${ENDPOINTS.CATEGORIES}?active=true`)
        const data = result.data || []
        setCategories(data.map(c => ({ nom: c.nom, slug: c.slug })))
        setCategoriesWithImages(data.filter(c => c.image_url?.trim()).map(c => ({ titre: c.nom, tagline: c.description || '', image: c.image_url || '', lien: `/boutique/${c.slug}` })))
        setSelectedCategoryName(data.find(c => c.slug === categorie)?.nom || null)
      } catch (e) { console.error(e) } finally { setLoadingCategories(false) }
    })()
  }, [categorie, initialCategories, categories.length, selectedCategoryName])

  return { produits, loadingProducts, categories, categoriesWithImages, loadingCategories }
}
