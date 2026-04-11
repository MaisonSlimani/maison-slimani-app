'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Category, HomeData, Product, SiteSettings } from '@maison/domain'
import { apiFetch, ENDPOINTS } from '@/lib/api/client'

export function useHomeData(initialData?: HomeData) {
  const [categories, setCategories] = useState(() => mapCategories(initialData?.categories))
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

  const { data: produitsVedette = initialData?.produitsVedette || [], isPending: loadingVedette } = useQuery({
    queryKey: ['produits', 'vedette'],
    staleTime: 15 * 60 * 1000,
    initialData: initialData?.produitsVedette,
    queryFn: async ({ signal }) => {
      const result = await apiFetch<Product[]>(`${ENDPOINTS.PRODUITS}?vedette=true&limit=6`, { signal })
      if (!result.success) throw new Error(result.error || 'Erreur API')
      return result.data || []
    },
  })

  useEffect(() => {
    if (initialData?.whatsappNumber) return
    const chargerSettings = async () => {
      try {
        const result = await apiFetch<SiteSettings>(ENDPOINTS.SETTINGS)
        if (result.success && result.data?.telephone) {
          setWhatsappNumber(formatWhatsApp(result.data.telephone))
        }
      } catch (err) { console.error(err) }
    }
    chargerSettings()
  }, [initialData])

  return { categories, loadingCategories, produitsVedette, loadingVedette, whatsappNumber, categorySlugMap }
}

function mapCategories(data: Category[] | undefined) {
  if (!data) return []
  return data
    .filter((cat) => cat.image_url?.trim())
    .map((cat) => ({
      titre: cat.nom,
      tagline: cat.description || '',
      image: cat.image_url!,
      lien: `/boutique/${cat.slug}`,
    }))
}

function getSlugMap(data: Category[] | undefined) {
  const map: Record<string, string> = {}
  if (!data) return map
  data.forEach((cat) => {
    if (cat.nom && cat.slug) map[cat.nom] = cat.slug
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
