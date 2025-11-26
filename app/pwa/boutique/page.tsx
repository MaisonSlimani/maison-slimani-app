'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import ProductCard from '@/components/pwa/ProductCard'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowUp } from 'lucide-react'

export default function PWABoutiquePage() {
  const searchParams = useSearchParams()
  const categorie = searchParams.get('categorie') || 'tous'
  const search = searchParams.get('search') || ''
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [triPrix, setTriPrix] = useState<string>('pertinence')

  const {
    data: produits = [],
    isPending: loading,
    refetch,
  } = useQuery({
    queryKey: ['produits', 'pwa', categorie, search, triPrix],
    staleTime: 2 * 60 * 1000,
    queryFn: async ({ signal }) => {
      const params = new URLSearchParams()
      if (categorie && categorie !== 'tous') {
        params.set('categorie', categorie)
      }
      if (search) {
        params.set('search', search)
      }
      if (triPrix !== 'pertinence') {
        params.set('sort', triPrix)
      }

      const response = await fetch(`/api/produits?${params.toString()}`, {
        signal,
      })

      if (!response.ok) {
        throw new Error(`Erreur API produits: ${response.status}`)
      }

      const payload = await response.json()
      return payload?.data || []
    },
  })

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [categorie])

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="w-full min-h-screen pb-20">
      {/* Header */}
      <div className="sticky top-14 z-30 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-2xl font-serif text-foreground">
            {search ? `Résultats pour "${search}"` : 'Boutique'}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Select value={triPrix} onValueChange={setTriPrix}>
            <SelectTrigger className="flex-1 h-9 text-sm">
              <SelectValue placeholder="Trier par" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pertinence">Pertinence</SelectItem>
              <SelectItem value="prix-asc">Prix croissant</SelectItem>
              <SelectItem value="prix-desc">Prix décroissant</SelectItem>
              <SelectItem value="nouveaute">Nouveautés</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="px-4 py-8 text-center text-muted-foreground">
          Chargement...
        </div>
      ) : produits.length === 0 ? (
        <div className="px-4 py-12 text-center">
          <p className="text-muted-foreground">Aucun produit trouvé</p>
        </div>
      ) : (
        <div className="px-4 py-4">
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
            {produits.map((produit: any, index: number) => (
              <motion.div
                key={produit.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <ProductCard produit={produit} />
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Scroll to Top */}
      {showScrollTop && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed bottom-24 right-4 z-50"
        >
          <Button
            size="icon"
            className="rounded-full bg-dore text-charbon hover:bg-dore/90 shadow-lg"
            onClick={scrollToTop}
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
        </motion.div>
      )}
    </div>
  )
}

