'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { tracker } from '@/lib/mixpanel-tracker'
import { trackViewCategory } from '@/lib/analytics'
import { FilterState } from '@/types'

import { CategoryPageData, Product } from '@maison/domain'

export function useCategoryData(initialData?: CategoryPageData | null) {
  const params = useParams()
  const searchParams = useSearchParams()
  const categorieSlug = params.categorie as string

  const [loadingCategory, setLoadingCategory] = useState(!initialData)
  const [triPrix, setTriPrix] = useState<string>('')
  const [categorieInfo, setCategorieInfo] = useState(() => getInitialCategoryInfo(initialData, categorieSlug))
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const [filters, setFilters] = useState<FilterState>({})

  const categorieNom = categorieInfo?.nom || null

  useEffect(() => {
    if (initialData?.category) return
    const charger = async () => {
      setLoadingCategory(true)
      const info = await fetchCategoryInfo(categorieSlug)
      setCategorieInfo(info)
      setLoadingCategory(false)
    }
    charger()
  }, [categorieSlug, initialData])

  const { data: produits = initialData?.products || [], isPending, isFetching } = useQuery<Product[]>({
    queryKey: ['categorie-produits', categorieSlug, categorieNom, triPrix, searchQuery, filters],
    staleTime: 2 * 60 * 1000,
    initialData: (!searchQuery && !triPrix && Object.keys(filters).length === 0) ? initialData?.products : undefined,
    enabled: categorieSlug === 'tous' || !!categorieNom,
    queryFn: async () => {
      const qParams = buildProductQueryParams(categorieSlug, categorieNom, triPrix, searchQuery, filters)
      const response = await fetch(`/api/v1/produits?${qParams.toString()}`)
      if (!response.ok) throw new Error(`Erreur: ${response.status}`)
      const payload = await response.json()
      return payload?.data || []
    },
  })

  useEffect(() => {
    if (produits.length > 0) {
      tracker.trackProductListViewed(`Category: ${categorieNom || 'All'}`, produits)
    }
  }, [produits, categorieNom])

  return {
    categorieSlug, categorieInfo, loadingCategory, produits, produitsLoading: isPending || isFetching,
    triPrix, setTriPrix, searchQuery, setSearchQuery, filters, setFilters
  }
}

function getInitialCategoryInfo(initialData: CategoryPageData | null | undefined, slug: string) {
  if (initialData?.category) {
    return {
      nom: initialData.category.nom,
      image: initialData.category.image_url || '/assets/hero-chaussures.jpg',
      description: initialData.category.description || '',
    }
  }
  if (slug === 'tous') {
    return {
      nom: 'Tous nos produits',
      image: '/assets/hero-chaussures.jpg',
      description: 'Explorez notre collection complète de chaussures homme haut de gamme.',
    }
  }
  return null
}

async function fetchCategoryInfo(slug: string) {
  if (!slug || slug === 'tous') {
    return {
      nom: 'Tous nos produits',
      image: '/assets/hero-chaussures.jpg',
      description: 'Explorez notre collection complète de chaussures homme haut de gamme.',
    }
  }
  try {
    const response = await fetch(`/api/v1/categories?slug=${encodeURIComponent(slug)}&active=true`)
    if (!response.ok) return null
    const payload = await response.json()
    const data = payload?.data?.[0]
    if (!data) {
      const info = { nom: 'Collection', image: '/assets/hero-chaussures.jpg', description: 'Découvrez notre collection.' }
      trackViewCategory(info.nom)
      return info
    }
    const info = { nom: data.nom, image: data.image_url || '/assets/hero-chaussures.jpg', description: data.description || '' }
    trackViewCategory(info.nom)
    return info
  } catch { return null }
}

function buildProductQueryParams(
  categorieSlug: string, 
  categorieNom: string | null, 
  triPrix: string, 
  searchQuery: string, 
  filters: FilterState
) {
  const qParams = new URLSearchParams()
  if (categorieSlug !== 'tous' && categorieNom) qParams.set('categorie', categorieNom)
  if (triPrix === 'prix-asc') qParams.set('sort', 'prix_asc')
  else if (triPrix === 'prix-desc') qParams.set('sort', 'prix_desc')
  
  if (searchQuery.trim()) qParams.set('search', searchQuery.trim())
  
  if (filters.minPrice !== undefined) qParams.set('minPrice', filters.minPrice.toString())
  if (filters.maxPrice !== undefined) qParams.set('maxPrice', filters.maxPrice.toString())
  if (filters.taille?.length) filters.taille.forEach((t: string) => qParams.append('taille', t))
  if (filters.couleur?.length) filters.couleur.forEach((c: string) => qParams.append('couleur', c))
  if (filters.inStock !== undefined) qParams.set('inStock', filters.inStock.toString())
  
  return qParams
}
