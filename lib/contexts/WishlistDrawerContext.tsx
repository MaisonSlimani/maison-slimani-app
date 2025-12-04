'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface WishlistDrawerContextType {
  isOpen: boolean
  openDrawer: () => void
  closeDrawer: () => void
  toggleDrawer: () => void
}

const WishlistDrawerContext = createContext<WishlistDrawerContextType | undefined>(undefined)

export function WishlistDrawerProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  const openDrawer = () => setIsOpen(true)
  const closeDrawer = () => setIsOpen(false)
  const toggleDrawer = () => setIsOpen(prev => !prev)

  return (
    <WishlistDrawerContext.Provider value={{ isOpen, openDrawer, closeDrawer, toggleDrawer }}>
      {children}
    </WishlistDrawerContext.Provider>
  )
}

export function useWishlistDrawer() {
  const context = useContext(WishlistDrawerContext)
  if (context === undefined) {
    throw new Error('useWishlistDrawer must be used within a WishlistDrawerProvider')
  }
  return context
}

