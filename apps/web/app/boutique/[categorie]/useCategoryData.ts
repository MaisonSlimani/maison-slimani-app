'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { tracker } from '@/lib/mixpanel-tracker'
import { trackViewCategory } from '@/lib/analytics'
import { FilterState } from '@/types'

export function useCategoryData() {
  const params = useParams()
  const searchParams = useSearchParams()
  const categorieSlug = params.categorie as string

  const [loadingCategory, setLoadingCategory] = useState(true)
  const [triPrix, setTriPrix] = useState<string>('')
  const [categorieInfo, setCategorieInfo] = useState<{ nom: string; image: string; description: string } | null>(null)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const [filters, setFilters] = useState<FilterState>({})

  const categorieNom = categorieInfo?.nom || null

  // Fetch Category Info
  useEffect(() => {
    const chargerCategorie = async () => {
      try {
        setLoadingCategory(true)
        if (!categorieSlug || categorieSlug === 'tous') {
          setCategorieInfo({
            nom: 'Tous nos produits',
            image: '/assets/hero-chaussures.jpg',
            description: 'Explorez notre collection complète de chaussures homme haut de gamme.',
          })
          setLoadingCategory(false)
          return
        }

        const response = await fetch(`/api/categories?slug=${encodeURIComponent(categorieSlug)}&active=true`)
        if (!response.ok) throw new Error(`Erreur API: ${response.status}`)
        
        const payload = await response.json()
        const data = payload?.data?.[0]

        if (!data) {
          const defaultInfo = { nom: 'Collection', image: '/assets/hero-chaussures.jpg', description: 'Découvrez notre collection.' }
          setCategorieInfo(defaultInfo)
          trackViewCategory(defaultInfo.nom)
        } else {
          const info = {
            nom: data.nom,
            image: data.image_url || '/assets/hero-chaussures.jpg',
            description: data.description || '',
          }
          setCategorieInfo(info)
          trackViewCategory(info.nom)
        }
      } catch (err) {
         console.error(err)
      } finally {
        setLoadingCategory(false)
      }
    }
    chargerCategorie()
  }, [categorieSlug])

  // Fetch Products
  const { data: produits = [], isPending: produitsPending, isFetching: produitsFetching } = useQuery({
    queryKey: ['categorie-produits', categorieSlug, categorieNom, triPrix, searchQuery, filters],
    staleTime: 2 * 60 * 1000,
    enabled: categorieSlug === 'tous' || !!categorieNom,
    queryFn: async () => {
      const qParams = buildProductQueryParams(categorieSlug, categorieNom, triPrix, searchQuery, filters)
      const response = await fetch(`/api/produits?${qParams.toString()}`)
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
    categorieSlug, categorieInfo, loadingCategory, produits, produitsLoading: produitsPending || produitsFetching,
    triPrix, setTriPrix, searchQuery, setSearchQuery, filters, setFilters
  }
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
