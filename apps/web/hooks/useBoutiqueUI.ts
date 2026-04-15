'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function useBoutiqueUI(search: string) {
  const router = useRouter()
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [searchQuery, setSearchQuery] = useState(search)
  const [isSearchOverlayOpen, setIsSearchOverlayOpen] = useState(false)

  useEffect(() => setSearchQuery(search), [search])

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })
  const clearSearch = () => { setSearchQuery(''); router.push('/boutique') }

  return { showScrollTop, searchQuery, setSearchQuery, isSearchOverlayOpen, setIsSearchOverlayOpen, scrollToTop, clearSearch }
}
