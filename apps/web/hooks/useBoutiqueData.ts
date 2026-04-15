'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Product, Category } from '@maison/domain'
import { apiFetch, ENDPOINTS } from '@/lib/api/client'
import { CategoryCardItem } from '@/types/views'

export function useBoutiqueData(categorySlug: string, search: string, initialCategories?: Category[]) {
  const [categories, setCategories] = useState<{ name: string; slug: string }[]>(() => {
    if (!initialCategories) return []
    return initialCategories.map(c => ({ name: c.name, slug: c.slug }))
  })
  
  const [categoriesWithImages, setCategoriesWithImages] = useState<CategoryCardItem[]>(() => {
    if (!initialCategories) return []
    return initialCategories
      .map(c => ({ 
        title: c.name, 
        tagline: c.description || '', 
        image: c.image_url || '/assets/hero-chaussures.jpg', 
        link: `/boutique/${c.slug}` 
      }))
  })

  const [selectedCategoryName, setSelectedCategoryName] = useState<string | null>(() => {
    if (!initialCategories) return null
    return initialCategories.find(c => c.slug === categorySlug)?.name || null
  })
  const [loadingCategories, setLoadingCategories] = useState(!initialCategories)

  const { data: products = [], isPending: loadingProducts } = useQuery<Product[]>({
    queryKey: ['produits', 'mobile', categorySlug, search, selectedCategoryName],
    staleTime: 2 * 60 * 1000,
    enabled: categorySlug !== 'tous' || !!search,
    queryFn: async ({ signal }) => {
      const q = new URLSearchParams()
      if (selectedCategoryName) q.set('category', selectedCategoryName)
      if (search) { 
        q.set('search', search)
        q.set('useFullText', 'true') 
      }
      const result = await apiFetch<Product[]>(`${ENDPOINTS.PRODUITS}?${q.toString()}`, { signal })
      return result.data || []
    },
  })

  useEffect(() => {
    if (initialCategories && categories.length > 0 && selectedCategoryName) return

    (async () => {
      try {
        setLoadingCategories(true)
        const result = await apiFetch<Category[]>(`${ENDPOINTS.CATEGORIES}?active=true`)
        const data = result.data || []
        setCategories(data.map(c => ({ name: c.name, slug: c.slug })))
    setCategoriesWithImages(data.map(c => ({ 
      title: c.name, 
      tagline: c.description || '', 
      image: c.image_url || '/assets/hero-chaussures.jpg', 
      link: `/boutique/${c.slug}` 
    })))
        setSelectedCategoryName(data.find(c => c.slug === categorySlug)?.name || null)
      } catch (e) { 
        console.error(e) 
      } finally { 
        setLoadingCategories(false) 
      }
    })()
  }, [categorySlug, initialCategories, categories.length, selectedCategoryName])

  return { products, loadingProducts, categories, categoriesWithImages, loadingCategories }
}
