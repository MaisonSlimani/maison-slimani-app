'use client'

import Link from 'next/link'
import Image from 'next/image'
import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function AdminStickyHeader() {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
    }
  }

  return (
    <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b border-border safe-area-top">
      <div className="h-14 px-4 flex items-center justify-between gap-3">
        {/* Logo */}
        <Link href="/pwa" className="flex items-center gap-2 flex-shrink-0 min-w-0">
          <div className="relative w-8 h-8 flex-shrink-0">
            <Image
              src="/assets/logos/logo_nobg.png"
              alt="Maison Slimani Admin"
              fill
              className="object-contain"
              sizes="32px"
              priority
              unoptimized
              onError={(e) => {
                const target = e.target as HTMLImageElement
                if (target.parentElement) {
                  target.parentElement.style.display = 'none'
                }
              }}
            />
          </div>
          <h1 className="text-lg font-serif tracking-tight whitespace-nowrap">
            MS <span className="text-dore">Admin</span>
          </h1>
        </Link>

        {/* Logout Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          className="w-10 h-10"
          aria-label="Déconnexion"
        >
          <LogOut className="w-5 h-5" />
        </Button>
      </div>
    </header>
  )
}

