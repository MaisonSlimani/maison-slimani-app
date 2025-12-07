'use client'

import { useIsPWA } from '@/lib/hooks/useIsPWA'
import NavigationDesktop from '@/components/NavigationDesktop'
import EnteteMobile from '@/components/EnteteMobile'
import Footer from '@/components/Footer'
import MenuBasNavigation from '@/components/MenuBasNavigation'
import BottomNav from '@/components/pwa/BottomNav'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

interface NavigationWrapperProps {
  children: React.ReactNode
}

export default function NavigationWrapper({ children }: NavigationWrapperProps) {
  const { isPWA, isLoading } = useIsPWA()
  const [isMounted, setIsMounted] = useState(false)
  const pathname = usePathname()

  // Ensure component is mounted before rendering navigation/footer to avoid hydration issues
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Reset mounted state when pathname changes (e.g., after page reload)
  useEffect(() => {
    setIsMounted(false)
    // Wait for page to be fully loaded before showing footer
    // This prevents footer from appearing at the top during page transitions
    const handleLoad = () => {
      setIsMounted(true)
    }
    
    if (document.readyState === 'complete') {
      // Page already loaded, set mounted after a small delay
      const timer = setTimeout(() => setIsMounted(true), 100)
      return () => clearTimeout(timer)
    } else {
      // Wait for page to load
      window.addEventListener('load', handleLoad)
      return () => {
        window.removeEventListener('load', handleLoad)
      }
    }
  }, [pathname])

  // Show minimal loading state - don't render footer during initial load or page transitions
  if (isLoading || !isMounted) {
    return (
      <>
        {children}
      </>
    )
  }

  // PWA mode - show bottom nav, no desktop nav/footer
  if (isPWA) {
    return (
      <>
        {children}
        <BottomNav />
      </>
    )
  }

  // Desktop mode - show desktop nav and footer
  return (
    <>
      <NavigationDesktop />
      <EnteteMobile />
      {children}
      <Footer />
      <MenuBasNavigation />
    </>
  )
}

