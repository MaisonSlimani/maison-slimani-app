'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Category } from '@maison/domain'

export function useHomeData() {
  const [categories, setCategories] = useState<Array<{ titre: string; tagline: string; image: string; lien: string }>>([])  
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [whatsappNumber, setWhatsappNumber] = useState<string | null>(null)
  const [categorySlugMap, setCategorySlugMap] = useState<Record<string, string>>({})

  const { data: categoriesData = [] } = useQuery({
    queryKey: ['categories-slug-map'],
    staleTime: 60 * 60 * 1000,
    queryFn: async ({ signal }) => {
      const response = await fetch('/api/categories?active=true', { signal })
      if (!response.ok) return []
      const payload = await response.json()
      return payload?.data || []
    },
  })

  useEffect(() => {
    if (categoriesData.length > 0) {
      const map: Record<string, string> = {}
      categoriesData.forEach((cat: Category) => {
        if (cat.nom && cat.slug) map[cat.nom] = cat.slug
      })
      setCategorySlugMap(map)
      
      const mapped = categoriesData
        .filter((cat: Category) => cat.image_url?.trim())
        .map((cat: Category) => ({
          titre: cat.nom,
          tagline: cat.description || '',
          image: cat.image_url!,
          lien: `/boutique/${cat.slug}`,
        }))
      setCategories(mapped)
      setLoadingCategories(false)
    }
  }, [categoriesData])

  const { data: produitsVedette = [], isPending: loadingVedette } = useQuery({
    queryKey: ['produits', 'vedette'],
    staleTime: 15 * 60 * 1000,
    queryFn: async ({ signal }) => {
      const response = await fetch('/api/produits?vedette=true&limit=6', { signal })
      if (!response.ok) throw new Error(`Erreur API: ${response.status}`)
      const payload = await response.json()
      return payload?.data || []
    },
  })

  useEffect(() => {
    const chargerSettings = async () => {
      try {
        const response = await fetch('/api/settings')
        if (!response.ok) return
        
        const result = await response.json()
        if (!result.success || !result.data?.telephone) return

        let phone = result.data.telephone.replace(/\s+/g, '').replace(/-/g, '').replace(/\+/g, '')
        if (!phone.startsWith('212')) {
          const processedPhone = phone.startsWith('0') ? phone.substring(1) : phone
          phone = '212' + processedPhone
        }
        setWhatsappNumber(phone)
      } catch (err) { console.error(err) }
    }
    chargerSettings()
  }, [])

  return { categories, loadingCategories, produitsVedette, loadingVedette, whatsappNumber, categorySlugMap }
}
