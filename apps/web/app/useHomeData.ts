'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Category, HomeData, Product, SiteSettings } from '@maison/domain'
import { apiFetch, ENDPOINTS } from '@/lib/api/client'
import { CategoryCardItem } from '@/types/views'

export function useHomeData(initialData?: HomeData) {
  const [categories, setCategories] = useState<CategoryCardItem[]>(() => mapCategories(initialData?.categories))
  const [loadingCategories, setLoadingCategories] = useState(!initialData?.categories)
  const [whatsappNumber, setWhatsappNumber] = useState(initialData?.whatsappNumber || null)
  const [categorySlugMap, setCategorySlugMap] = useState<Record<string, string>>(() => getSlugMap(initialData?.categories))

  const { data: categoriesData = [] } = useQuery({
    queryKey: ['categories-slug-map'],
    staleTime: 60 * 60 * 1000,
    initialData: initialData?.categories,
    queryFn: async ({ signal }) => {
      const result = await apiFetch<Category[]>(`${ENDPOINTS.CATEGORIES}?active=true`, { signal })
      return result.data || []
    },
  })

  useEffect(() => {
    if (categoriesData.length > 0 && !initialData?.categories) {
      setCategorySlugMap(getSlugMap(categoriesData))
      setCategories(mapCategories(categoriesData))
      setLoadingCategories(false)
    }
  }, [categoriesData, initialData])

  const { data: featuredProducts = initialData?.featuredProducts || [], isPending: loadingFeatured } = useQuery({
    queryKey: ['produits', 'featured'],
    staleTime: 15 * 60 * 1000,
    initialData: initialData?.featuredProducts,
    queryFn: async ({ signal }) => {
      const result = await apiFetch<Product[]>(`${ENDPOINTS.PRODUITS}?vedette=true&limit=6`, { signal })
      if (!result.success) throw new Error(result.error || 'Erreur API')
      return result.data || []
    },
  })

  useEffect(() => {
    if (initialData?.whatsappNumber) return
    const chargeSettings = async () => {
      try {
        const result = await apiFetch<SiteSettings>(ENDPOINTS.SETTINGS)
        if (result.success && result.data?.phone) {
          setWhatsappNumber(formatWhatsApp(result.data.phone))
        }
      } catch (err) { console.error(err) }
    }
    chargeSettings()
  }, [initialData])

  return { 
    categories, 
    loadingCategories, 
    featuredProducts, 
    loadingFeatured, 
    whatsappNumber, 
    categorySlugMap 
  }
}

function mapCategories(data: Category[] | undefined): CategoryCardItem[] {
  if (!data) return []
  return data
    .filter((cat) => cat.image_url?.trim())
    .map((cat) => ({
      title: cat.name,
      tagline: cat.description || '',
      image: cat.image_url!,
      link: `/boutique/${cat.slug}`,
    }))
}

function getSlugMap(data: Category[] | undefined) {
  const map: Record<string, string> = {}
  if (!data) return map
  data.forEach((cat) => {
    if (cat.name && cat.slug) map[cat.name] = cat.slug
  })
  return map
}

function formatWhatsApp(phone: string) {
  let processed = phone.replace(/\s+/g, '').replace(/-/g, '').replace(/\+/g, '')
  if (!processed.startsWith('212')) {
    processed = processed.startsWith('0') ? processed.substring(1) : processed
    processed = '212' + processed
  }
  return processed
}
