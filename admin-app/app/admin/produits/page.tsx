'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Package, ArrowRight, Settings } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { toast } from 'sonner'

const colorSchemes = [
  { color: 'from-blue-50 to-blue-100', borderColor: 'border-blue-200' },
  { color: 'from-amber-50 to-amber-100', borderColor: 'border-amber-200' },
  { color: 'from-purple-50 to-purple-100', borderColor: 'border-purple-200' },
  { color: 'from-green-50 to-green-100', borderColor: 'border-green-200' },
  { color: 'from-pink-50 to-pink-100', borderColor: 'border-pink-200' },
  { color: 'from-indigo-50 to-indigo-100', borderColor: 'border-indigo-200' },
]

export default function AdminProduitsPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    window.scrollTo(0, 0)
    chargerCategories()
  }, [])

  const chargerCategories = async () => {
    try {
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

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif mb-2">Gestion des produits</h1>
          <p className="text-muted-foreground">Sélectionnez une catégorie pour gérer les produits</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/categories">
            <Settings className="w-4 h-4 mr-2" />
            Gérer les catégories
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Chargement des catégories...</div>
      ) : categories.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-muted-foreground mb-4">Aucune catégorie active</p>
          <Button asChild>
            <Link href="/admin/categories">
              <Settings className="w-4 h-4 mr-2" />
              Créer une catégorie
            </Link>
          </Button>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {categories.map((categorie, index) => (
          <motion.div
            key={categorie.slug}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card
              className={cn(
                'p-6 cursor-pointer transition-all hover:shadow-xl border-2 overflow-hidden group',
                `bg-gradient-to-br ${categorie.color} ${categorie.borderColor} hover:scale-105`
              )}
              onClick={() => router.push(`/admin/produits/${categorie.slug}`)}
            >
              <div className="flex gap-6 items-start">
                <div className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-white/50 flex-shrink-0 shadow-lg">
                  <Image
                    src={categorie.image}
                    alt={categorie.nom}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                    sizes="96px"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <h3 className="text-2xl font-serif mb-2 text-charbon">{categorie.nom}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {categorie.description}
                      </p>
                    </div>
                    <Package className="w-6 h-6 text-dore flex-shrink-0 mt-1" />
                  </div>
                  <Button
                    variant="outline"
                    className="mt-4 group-hover:bg-white group-hover:text-charbon"
                    onClick={(e) => {
                      e.stopPropagation()
                      router.push(`/admin/produits/${categorie.slug}`)
                    }}
                  >
                    Gérer les produits
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
        </div>
      )}

      <Card className="p-6 bg-muted/30 border-dashed">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            Vous souhaitez voir tous les produits en même temps ?
          </p>
          <Button
            variant="outline"
            onClick={() => router.push('/admin/produits/tous')}
          >
            Voir tous les produits
          </Button>
        </div>
      </Card>
    </div>
  )
}
