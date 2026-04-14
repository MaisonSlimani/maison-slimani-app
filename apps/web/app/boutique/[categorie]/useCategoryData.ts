'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { tracker } from '@/lib/mixpanel-tracker'
import { trackViewCategory } from '@/lib/analytics'
import { FilterState } from '@/types'

import { CategoryPageData, Product } from '@maison/domain'
import { resolveInitialCategoryInfo, buildProductQueryParams } from '@/lib/utils/product-processing'

export function useCategoryData(initialData?: CategoryPageData | null) {
  const params = useParams()
  const searchParams = useSearchParams()
  const categorySlug = params.categorie as string

  const [loadingCategory, setLoadingCategory] = useState(!initialData)
  const [triPrice, setTriPrice] = useState<string>('')
  const [categoryInfo, setCategoryInfo] = useState(() => resolveInitialCategoryInfo(initialData, categorySlug))
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const [filters, setFilters] = useState<FilterState>({})

  const categoryName = categoryInfo?.name || null

  useEffect(() => {
    if (initialData?.category) return
    const charge = async () => {
      setLoadingCategory(true)
      const info = await fetchCategoryInfo(categorySlug)
      setCategoryInfo(info)
      setLoadingCategory(false)
    }
    charge()
  }, [categorySlug, initialData])

  const { data: products = initialData?.products || [], isPending, isFetching } = useQuery<Product[]>({
    queryKey: ['category-products', categorySlug, categoryName, triPrice, searchQuery, filters],
    staleTime: 2 * 60 * 1000,
    initialData: (!searchQuery && !triPrice && Object.keys(filters).length === 0) ? initialData?.products : undefined,
    enabled: categorySlug === 'tous' || !!categoryName,
    queryFn: async () => {
      const qParams = buildProductQueryParams(categorySlug, categoryName || '', triPrice, searchQuery, filters)
      const response = await fetch(`/api/v1/produits?${qParams.toString()}`)
      if (!response.ok) throw new Error(`Erreur: ${response.status}`)
      const payload = await response.json()
      return payload?.data || []
    },
  })

  useEffect(() => {
    if (products.length > 0) {
      tracker.trackProductListViewed(`Category: ${categoryName || 'All'}`, products)
    }
  }, [products, categoryName])

  return {
    categorySlug, categoryInfo, loadingCategory, products, productsLoading: isPending || isFetching,
    triPrice, setTriPrice, searchQuery, setSearchQuery, filters, setFilters
  }
}

async function fetchCategoryInfo(slug: string) {
  if (!slug || slug === 'tous') {
    return {
      name: 'Tous nos produits',
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
      const info = { name: 'Collection', image: '/assets/hero-chaussures.jpg', description: 'Découvrez notre collection.' }
      trackViewCategory(info.name)
      return info
    }
    const info = { name: data.name, image: data.image_url || '/assets/hero-chaussures.jpg', description: data.description || '' }
    trackViewCategory(info.name)
    return info
  } catch { return null }
}
