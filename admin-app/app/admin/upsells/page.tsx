'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { X, Package, Search, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface Produit {
  id: string
  nom: string
  prix: number
  image_url?: string
  categorie: string
  upsell_products?: string[]
}

export default function AdminUpsellsPage() {
  const [produits, setProduits] = useState<Produit[]>([])
  const [selectedProduit, setSelectedProduit] = useState<Produit | null>(null)
  const [upsellProducts, setUpsellProducts] = useState<string[]>([])
  const [availableProducts, setAvailableProducts] = useState<Produit[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const supabase = createClient()

  const chargerProduits = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('produits')
        .select('id, nom, prix, image_url, categorie, upsell_products')
        .order('nom', { ascending: true })

      if (error) {
        console.error('Erreur Supabase:', error)
        throw new Error(error.message || 'Erreur lors du chargement des produits')
      }
      setProduits(data || [])
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error)
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Erreur lors du chargement des produits'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    chargerProduits()
  }, [chargerProduits])

  const ouvrirDialog = (produit: Produit) => {
    setSelectedProduit(produit)
    setUpsellProducts((produit.upsell_products as string[]) || [])
    setSearchQuery('')
    chargerProduitsDisponibles(produit.id)
    setDialogOpen(true)
  }

  const chargerProduitsDisponibles = async (excludeId: string) => {
    try {
      const { data, error } = await supabase
        .from('produits')
        .select('id, nom, prix, image_url, categorie')
        .neq('id', excludeId)
        .order('nom', { ascending: true })

      if (error) throw error
      setAvailableProducts(data || [])
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const ajouterUpsell = (productId: string) => {
    if (!upsellProducts.includes(productId) && upsellProducts.length < 5) {
      setUpsellProducts([...upsellProducts, productId])
      toast.success('Produit ajouté aux upsells')
    } else if (upsellProducts.length >= 5) {
      toast.error('Maximum 5 upsells par produit')
    }
  }

  const retirerUpsell = (productId: string) => {
    setUpsellProducts(upsellProducts.filter(id => id !== productId))
    toast.success('Produit retiré des upsells')
  }

  const sauvegarderUpsells = async () => {
    if (!selectedProduit) return

    try {
      const { error } = await supabase
        .from('produits')
        .update({ upsell_products: upsellProducts })
        .eq('id', selectedProduit.id)

      if (error) throw error

      toast.success('Upsells mis à jour avec succès')
      setDialogOpen(false)
      chargerProduits()
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors de la sauvegarde')
    }
  }

  const produitsFiltres = availableProducts.filter(p =>
    p.nom.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const produitsAvecUpsells = produits.filter(p => 
    (p.upsell_products as string[])?.length > 0
  )

  return (
    <div className="p-8 space-y-8 bg-gradient-to-b from-background to-muted/20 min-h-screen">
      {/* Header with luxurious styling */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-2"
      >
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-dore/10 border border-dore/20">
            <Sparkles className="w-6 h-6 text-dore" />
          </div>
          <div>
            <h1 className="text-4xl font-serif text-charbon">Gestion des Upsells</h1>
            <p className="text-muted-foreground mt-1">
              Configurez les produits recommandés pour maximiser vos ventes
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-gradient-to-br from-background to-dore/5 border-dore/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Produits</p>
              <p className="text-3xl font-serif text-charbon">{produits.length}</p>
            </div>
            <Package className="w-8 h-8 text-dore/60" />
          </div>
        </Card>
        <Card className="p-6 bg-gradient-to-br from-background to-dore/5 border-dore/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Avec Upsells</p>
              <p className="text-3xl font-serif text-charbon">{produitsAvecUpsells.length}</p>
            </div>
            <Sparkles className="w-8 h-8 text-dore/60" />
          </div>
        </Card>
        <Card className="p-6 bg-gradient-to-br from-background to-dore/5 border-dore/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Sans Upsells</p>
              <p className="text-3xl font-serif text-charbon">
                {produits.length - produitsAvecUpsells.length}
              </p>
            </div>
            <Package className="w-8 h-8 text-muted-foreground/40" />
          </div>
        </Card>
      </div>

      {/* Liste des produits */}
      <Card className="p-6 border-dore/20 bg-gradient-to-br from-background to-muted/10">
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-dore"></div>
              <p className="text-muted-foreground mt-4">Chargement...</p>
            </div>
          ) : produits.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Aucun produit disponible</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {produits.map((produit) => {
                const upsells = (produit.upsell_products as string[]) || []
                return (
                  <motion.div
                    key={produit.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "flex items-center justify-between p-5 rounded-lg border transition-all duration-300",
                      "hover:shadow-lg hover:border-dore/40",
                      upsells.length > 0 
                        ? "bg-gradient-to-r from-dore/5 to-transparent border-dore/30" 
                        : "bg-background border-border hover:bg-muted/50"
                    )}
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      {produit.image_url && (
                        <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border border-border shadow-sm">
                          <Image
                            src={produit.image_url}
                            alt={produit.nom}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-charbon truncate">{produit.nom}</h3>
                        <p className="text-sm text-muted-foreground">
                          {produit.categorie} • {produit.prix.toLocaleString('fr-MA')} DH
                        </p>
                        {upsells.length > 0 && (
                          <div className="flex items-center gap-2 mt-2">
                            <Sparkles className="w-4 h-4 text-dore" />
                            <p className="text-xs text-dore font-medium">
                              {upsells.length} upsell{upsells.length > 1 ? 's' : ''} configuré{upsells.length > 1 ? 's' : ''}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      onClick={() => ouvrirDialog(produit)}
                      variant={upsells.length > 0 ? "default" : "outline"}
                      size="sm"
                      className={cn(
                        "transition-all duration-300",
                        upsells.length > 0 
                          ? "bg-dore text-charbon hover:bg-dore/90 border-dore" 
                          : "border-dore/30 hover:border-dore hover:bg-dore/5"
                      )}
                    >
                      <Package className="w-4 h-4 mr-2" />
                      {upsells.length > 0 ? 'Modifier' : 'Configurer'}
                    </Button>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </Card>

      {/* Dialog de configuration */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-background to-muted/10 border-dore/20">
          <DialogHeader className="border-b border-dore/10 pb-4">
            <DialogTitle className="text-2xl font-serif text-charbon flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-dore" />
              Configurer les Upsells
            </DialogTitle>
            <DialogDescription className="text-base mt-2">
              Sélectionnez jusqu'à 5 produits premium à recommander pour{' '}
              <span className="font-semibold text-charbon">{selectedProduit?.nom}</span>
            </DialogDescription>
          </DialogHeader>

          {selectedProduit && (
            <div className="space-y-6 pt-4">
              {/* Produit sélectionné */}
              <Card className="p-5 bg-gradient-to-r from-dore/10 to-transparent border-dore/30">
                <div className="flex items-center gap-4">
                  {selectedProduit.image_url && (
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 border-2 border-dore/30 shadow-md">
                      <Image
                        src={selectedProduit.image_url}
                        alt={selectedProduit.nom}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-lg text-charbon">{selectedProduit.nom}</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedProduit.categorie} • {selectedProduit.prix.toLocaleString('fr-MA')} DH
                    </p>
                  </div>
                </div>
              </Card>

              {/* Upsells sélectionnés */}
              {upsellProducts.length > 0 && (
                <div>
                  <Label className="mb-3 block text-base font-semibold text-charbon">
                    Upsells sélectionnés ({upsellProducts.length}/5)
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {upsellProducts.map((upsellId) => {
                      const produit = availableProducts.find(p => p.id === upsellId)
                      if (!produit) return null
                      return (
                        <motion.div
                          key={upsellId}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex items-center gap-4 p-4 border-2 border-dore/40 rounded-lg bg-gradient-to-r from-dore/10 to-transparent shadow-sm"
                        >
                          {produit.image_url && (
                            <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-dore/20">
                              <Image
                                src={produit.image_url}
                                alt={produit.nom}
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-charbon truncate">{produit.nom}</p>
                            <p className="text-xs text-muted-foreground">
                              {produit.prix.toLocaleString('fr-MA')} DH
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-red-500/10 hover:text-red-600"
                            onClick={() => retirerUpsell(upsellId)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </motion.div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Recherche de produits */}
              <div>
                <Label className="mb-3 block text-base font-semibold text-charbon">
                  Rechercher des produits
                </Label>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par nom..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-dore/20 focus:border-dore"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-2">
                  {produitsFiltres
                    .filter(p => !upsellProducts.includes(p.id))
                    .map((produit) => (
                      <motion.div
                        key={produit.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={cn(
                          "flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all duration-300",
                          "hover:border-dore/40 hover:bg-dore/5 hover:shadow-md",
                          "border-border"
                        )}
                        onClick={() => ajouterUpsell(produit.id)}
                      >
                        {produit.image_url && (
                          <div className="relative w-14 h-14 rounded overflow-hidden flex-shrink-0 border border-border">
                            <Image
                              src={produit.image_url}
                              alt={produit.nom}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-charbon truncate">{produit.nom}</p>
                          <p className="text-xs text-muted-foreground">
                            {produit.prix.toLocaleString('fr-MA')} DH
                          </p>
                        </div>
                        {upsellProducts.length < 5 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-dore/20 hover:text-dore"
                            onClick={(e) => {
                              e.stopPropagation()
                              ajouterUpsell(produit.id)
                            }}
                          >
                            <Package className="w-4 h-4" />
                          </Button>
                        )}
                      </motion.div>
                    ))}
                </div>
                {upsellProducts.length >= 5 && (
                  <p className="text-sm text-muted-foreground mt-2 text-center">
                    Maximum 5 upsells atteint
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-6 border-t border-dore/10">
                <Button 
                  variant="outline" 
                  onClick={() => setDialogOpen(false)}
                  className="border-dore/30 hover:border-dore"
                >
                  Annuler
                </Button>
                <Button 
                  onClick={sauvegarderUpsells} 
                  className="bg-dore text-charbon hover:bg-dore/90 shadow-lg"
                >
                  Sauvegarder
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

