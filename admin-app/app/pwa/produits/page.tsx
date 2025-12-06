'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Package, ArrowRight, Settings } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { LuxuryLoading } from '@/components/ui/luxury-loading'

const colorSchemes = [
  { color: 'from-blue-50 to-blue-100', borderColor: 'border-blue-200' },
  { color: 'from-amber-50 to-amber-100', borderColor: 'border-amber-200' },
  { color: 'from-purple-50 to-purple-100', borderColor: 'border-purple-200' },
  { color: 'from-green-50 to-green-100', borderColor: 'border-green-200' },
  { color: 'from-pink-50 to-pink-100', borderColor: 'border-pink-200' },
  { color: 'from-indigo-50 to-indigo-100', borderColor: 'border-indigo-200' },
]

export default function AdminPWAProduitsPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
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
      }
    }

    verifierSession()
    chargerCategories()
  }, [router])

  const chargerCategories = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/categories')
      if (!response.ok) throw new Error('Erreur lors du chargement')
      
      const result = await response.json()
      const categoriesData = result.data || []
      
      // Map categories with color schemes
      const categoriesWithColors = categoriesData
        .filter((cat: any) => cat.active !== false)
        .map((cat: any, index: number) => ({
          slug: cat.slug,
          nom: cat.nom,
          description: cat.description || '',
          image: cat.image_url || '/assets/categorie-default.jpg',
          ...colorSchemes[index % colorSchemes.length],
        }))
      
      setCategories(categoriesWithColors)
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error)
      toast.error('Erreur lors du chargement des catégories')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="w-full">
        <div className="px-4 py-8 text-center text-muted-foreground">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-serif text-foreground">Produits</h1>
            <p className="text-sm text-muted-foreground mt-1">Sélectionnez une catégorie</p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/pwa/categories">
              <Settings className="w-4 h-4 mr-2" />
              Catégories
            </Link>
          </Button>
        </div>

        {categories.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-muted-foreground mb-4">Aucune catégorie active</p>
            <Button asChild>
              <Link href="/pwa/categories">
                <Settings className="w-4 h-4 mr-2" />
                Créer une catégorie
              </Link>
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {categories.map((categorie, index) => (
              <Card
                key={categorie.slug}
                className={cn(
                  'p-4 cursor-pointer transition-all hover:shadow-lg border-2 overflow-hidden',
                  `bg-gradient-to-br ${categorie.color} ${categorie.borderColor}`
                )}
                onClick={() => router.push(`/pwa/produits/${categorie.slug}`)}
              >
                <div className="flex gap-4 items-center">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden border-2 border-white/50 flex-shrink-0">
                    <Image
                      src={categorie.image}
                      alt={categorie.nom}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-lg font-serif text-charbon mb-1">{categorie.nom}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {categorie.description || 'Aucune description'}
                        </p>
                      </div>
                      <Package className="w-5 h-5 text-dore flex-shrink-0" />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3 w-full bg-white/80 hover:bg-white"
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/pwa/produits/${categorie.slug}`)
                      }}
                    >
                      Gérer les produits
                      <ArrowRight className="w-3 h-3 ml-2" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <Card className="p-4 bg-muted/30 border-dashed">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-3">
              Voir tous les produits en même temps ?
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/pwa/produits/tous')}
            >
              Voir tous les produits
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}

