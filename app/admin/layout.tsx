'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Settings,
  LogOut,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Vérifier la session au chargement
    const verifierSession = async () => {
      try {
        const response = await fetch('/api/auth/session')
        const data = await response.json()
        
        if (!data.authenticated) {
          router.push('/login')
          return
        }
      } catch (error) {
        router.push('/login')
        return
      } finally {
        setLoading(false)
      }
    }

    verifierSession()
  }, [router])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Chargement...</div>
      </div>
    )
  }

  const menuItems = [
    { href: '/admin', label: 'Tableau de bord', icon: LayoutDashboard },
    { href: '/admin/produits', label: 'Produits', icon: Package },
    { href: '/admin/commandes', label: 'Commandes', icon: ShoppingBag },
    { href: '/admin/parametres', label: 'Paramètres', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-charbon text-ecru">
      <div className="flex h-screen">
        {/* Sidebar */}
        <aside className="w-64 bg-charbon border-r border-ecru/20 flex flex-col">
          <div className="p-6 border-b border-ecru/20">
            <h1 className="text-2xl font-serif">
              Maison <span className="text-dore">Slimani</span>
            </h1>
            <p className="text-sm text-ecru/70 mt-1">Administration</p>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                    isActive
                      ? 'bg-dore/20 text-dore border border-dore/30'
                      : 'text-ecru/80 hover:text-ecru hover:bg-ecru/10'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>

          <div className="p-4 border-t border-ecru/20">
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start text-ecru/80 hover:text-ecru"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Déconnexion
            </Button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          <div className="p-8">{children}</div>
        </main>
      </div>
    </div>
  )
}

