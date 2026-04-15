import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useRecentSearches } from '@/hooks/use-recent-searches'

export interface SimpleProduct {
  id: string;
  name: string;
  price: number;
  image_url: string;
  slug: string;
  category?: string;
}

export function useSearchOverlay(isOpen: boolean, onClose: () => void, basePath: string) {
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { recentSearches, addSearch, clearAll } = useRecentSearches()

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 200)
    return () => clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    } else {
      setSearchQuery('')
    }
  }, [isOpen])

  const { data: results, isLoading } = useQuery<SimpleProduct[]>({
    queryKey: ['search-live', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery.trim()) return []
      const resp = await fetch(`/api/v1/produits?search=${encodeURIComponent(debouncedQuery)}&limit=8`)
      const res = await resp.json()
      return res.data || res.items || []
    },
    enabled: isOpen && debouncedQuery.length > 0
  })

  const handleSearch = useCallback(() => {
    if (!debouncedQuery.trim()) return
    addSearch(debouncedQuery.trim())
    router.push(`${basePath}/boutique?search=${encodeURIComponent(debouncedQuery.trim())}`)
    onClose()
  }, [debouncedQuery, basePath, router, onClose, addSearch])

  return {
    searchQuery,
    setSearchQuery,
    debouncedQuery,
    inputRef,
    results,
    isLoading,
    recentSearches,
    clearAll,
    handleSearch
  }
}
