'use client'

import { useIsPWA } from '@/lib/hooks/useIsPWA'
import NavigationDesktop from '@/components/NavigationDesktop'
import EnteteMobile from '@/components/EnteteMobile'
import Footer from '@/components/Footer'
import MenuBasNavigation from '@/components/MenuBasNavigation'
import BottomNav from '@/components/pwa/BottomNav'

interface NavigationWrapperProps {
  children: React.ReactNode
}

export default function NavigationWrapper({ children }: NavigationWrapperProps) {
  const { isPWA, isLoading } = useIsPWA()

  // Show minimal loading state
  if (isLoading) {
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

