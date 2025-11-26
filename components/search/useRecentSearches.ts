'use client'

import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'maison-slimani-recent-searches'
const MAX_RECENT_SEARCHES = 10

export interface RecentSearch {
  query: string
  timestamp: number
}

export function useRecentSearches() {
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load recent searches from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as RecentSearch[]
        // Filter out searches older than 30 days
        const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
        const validSearches = parsed.filter((s) => s.timestamp > thirtyDaysAgo)
        setRecentSearches(validSearches)
      }
    } catch (error) {
      console.error('Error loading recent searches:', error)
    }
    setIsLoaded(true)
  }, [])

  // Save to localStorage whenever recentSearches changes
  const saveToStorage = useCallback((searches: RecentSearch[]) => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(searches))
    } catch (error) {
      console.error('Error saving recent searches:', error)
    }
  }, [])

  // Add a new search
  const addSearch = useCallback(
    (query: string) => {
      const trimmedQuery = query.trim().toLowerCase()
      if (!trimmedQuery || trimmedQuery.length < 2) return

      setRecentSearches((prev) => {
        // Remove existing entry if it exists
        const filtered = prev.filter(
          (s) => s.query.toLowerCase() !== trimmedQuery
        )
        
        // Add new search at the beginning
        const newSearch: RecentSearch = {
          query: query.trim(),
          timestamp: Date.now(),
        }
        
        const updated = [newSearch, ...filtered].slice(0, MAX_RECENT_SEARCHES)
        saveToStorage(updated)
        return updated
      })
    },
    [saveToStorage]
  )

  // Remove a specific search
  const removeSearch = useCallback(
    (query: string) => {
      setRecentSearches((prev) => {
        const filtered = prev.filter(
          (s) => s.query.toLowerCase() !== query.toLowerCase()
        )
        saveToStorage(filtered)
        return filtered
      })
    },
    [saveToStorage]
  )

  // Clear all recent searches
  const clearAll = useCallback(() => {
    setRecentSearches([])
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_KEY)
      } catch (error) {
        console.error('Error clearing recent searches:', error)
      }
    }
  }, [])

  // Get recent searches as a simple string array
  const getQueries = useCallback(() => {
    return recentSearches.map((s) => s.query)
  }, [recentSearches])

  return {
    recentSearches,
    isLoaded,
    addSearch,
    removeSearch,
    clearAll,
    getQueries,
  }
}

export default useRecentSearches

