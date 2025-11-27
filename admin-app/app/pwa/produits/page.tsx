'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminPWAProduitsPage() {
  const router = useRouter()
  const [produits, setProduits] = useState<any[]>([])
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
    chargerProduits()
  }, [router])

  const chargerProduits = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/produits')
      if (!response.ok) throw new Error('Erreur')
      const result = await response.json()
      setProduits(result.data || [])
    } catch (error) {
      toast.error('Erreur lors du chargement')
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
          <h1 className="text-2xl font-serif text-foreground">Produits</h1>
          <Button size="sm" className="bg-dore text-charbon hover:bg-dore/90">
            <Plus className="w-4 h-4 mr-2" />
            Ajouter
          </Button>
        </div>

        <div className="space-y-3">
          {produits.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Aucun produit</p>
          ) : (
            produits.map((produit) => (
              <Card key={produit.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-serif font-semibold text-foreground">{produit.nom}</h3>
                    <p className="text-sm text-muted-foreground">{produit.categorie}</p>
                    <p className="text-dore font-semibold mt-1">
                      {produit.prix.toLocaleString('fr-MA')} MAD
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/pwa/produits/${produit.id}`)}
                  >
                    Modifier
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

