'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Eye, Download, AlertCircle, Package, Truck, CheckCircle, XCircle, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

export default function AdminCommandesPage() {
  const [commandes, setCommandes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filtreStatut, setFiltreStatut] = useState<string>('tous')
  const [selectedCommande, setSelectedCommande] = useState<any>(null)

  useEffect(() => {
    chargerCommandes()
  }, [filtreStatut])

  const chargerCommandes = async () => {
    try {
      const response = await fetch(`/api/admin/commandes?statut=${filtreStatut}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors du chargement des commandes')
      }

      const result = await response.json()
      setCommandes(result.data || [])
    } catch (error: any) {
      console.error('Erreur lors du chargement des commandes:', error)
      toast.error(error.message || 'Erreur lors du chargement des commandes')
    } finally {
      setLoading(false)
    }
  }

  const handleStatutChange = async (commandeId: string, nouveauStatut: string) => {
    try {
      const response = await fetch('/api/admin/commandes', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: commandeId,
          statut: nouveauStatut,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la mise à jour')
      }

      toast.success('Statut mis à jour')
      chargerCommandes()
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour:', error)
      toast.error(error.message || 'Erreur lors de la mise à jour')
    }
  }

  const handleDelete = async (commandeId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette commande ? Cette action est irréversible.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/commandes?id=${commandeId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la suppression')
      }

      toast.success('Commande supprimée')
      chargerCommandes()
    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error)
      toast.error(error.message || 'Erreur lors de la suppression')
    }
  }

  const handleExportCSV = () => {
    const csv = [
      ['ID', 'Client', 'Téléphone', 'Ville', 'Total', 'Statut', 'Date'].join(','),
      ...commandes.map((c) =>
        [
          c.id.substring(0, 8),
          c.nom_client,
          c.telephone,
          c.ville,
          c.total,
          c.statut,
          new Date(c.date_commande).toLocaleDateString('fr-FR'),
        ].join(',')
      ),
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `commandes-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return <div>Chargement...</div>
  }

  // Grouper les commandes par statut
  const commandesParStatut = commandes.reduce((acc, commande) => {
    const statut = commande.statut || 'En attente'
    if (!acc[statut]) {
      acc[statut] = []
    }
    acc[statut].push(commande)
    return acc
  }, {} as Record<string, typeof commandes>)

  // Ordre d'affichage des statuts (nouvelles commandes en premier)
  const statutsOrdre = ['En attente', 'Expédiée', 'Livrée', 'Annulée']
  const statutsAffiches = statutsOrdre.filter(statut => commandesParStatut[statut]?.length > 0)

  const getStatutIcon = (statut: string) => {
    switch (statut) {
      case 'En attente':
        return <AlertCircle className="w-4 h-4" />
      case 'Expédiée':
        return <Truck className="w-4 h-4" />
      case 'Livrée':
        return <CheckCircle className="w-4 h-4" />
      case 'Annulée':
        return <XCircle className="w-4 h-4" />
      default:
        return <Package className="w-4 h-4" />
    }
  }

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'En attente':
        return 'bg-yellow-400/20 text-yellow-600 border-yellow-400/30'
      case 'Expédiée':
        return 'bg-blue-400/20 text-blue-600 border-blue-400/30'
      case 'Livrée':
        return 'bg-green-400/20 text-green-600 border-green-400/30'
      case 'Annulée':
        return 'bg-red-400/20 text-red-600 border-red-400/30'
      default:
        return 'bg-muted text-muted-foreground border-border'
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif mb-2">Gestion des commandes</h1>
          <p className="text-muted-foreground">Visualisez et gérez toutes les commandes</p>
        </div>
        <div className="flex gap-4">
          <Select value={filtreStatut} onValueChange={setFiltreStatut}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrer par statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tous">Tous les statuts</SelectItem>
              <SelectItem value="En attente">En attente</SelectItem>
              <SelectItem value="Expédiée">Expédiée</SelectItem>
              <SelectItem value="Livrée">Livrée</SelectItem>
              <SelectItem value="Annulée">Annulée</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-2" />
            Exporter CSV
          </Button>
        </div>
      </div>

      {/* Groupement par statut */}
      {filtreStatut === 'tous' ? (
        <div className="space-y-8">
          {statutsAffiches.map((statut) => (
            <div key={statut}>
              <div className="flex items-center gap-3 mb-6">
                {getStatutIcon(statut)}
                <h2 className="text-2xl font-serif">{statut}</h2>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatutColor(statut)}`}>
                  {commandesParStatut[statut].length} commande{commandesParStatut[statut].length > 1 ? 's' : ''}
                </span>
              </div>
              
              <div className="grid gap-4">
                {commandesParStatut[statut].map((commande) => (
                  <Card key={commande.id} className={`p-6 bg-card border-2 transition-all hover:shadow-lg ${
                    statut === 'En attente' ? 'border-yellow-400/50 bg-yellow-50/30' : 'border-border'
                  }`}>
                    <div className="flex gap-6">
                      {/* Produits avec images */}
                      <div className="flex gap-2 flex-shrink-0">
                        {(commande.produits || []).slice(0, 3).map((p: any, idx: number) => (
                          <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-border bg-muted">
                            {p.image_url ? (
                              <Image
                                src={p.image_url}
                                alt={p.nom}
                                fill
                                className="object-cover"
                                sizes="64px"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                                {p.nom.substring(0, 2)}
                              </div>
                            )}
                          </div>
                        ))}
                        {(commande.produits || []).length > 3 && (
                          <div className="relative w-16 h-16 rounded-lg border border-border bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                            +{(commande.produits || []).length - 3}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-3">
                            <h3 className="text-xl font-serif">
                              Commande #{commande.id.substring(0, 8)}
                            </h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatutColor(statut)}`}>
                              {commande.statut}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {new Date(commande.date_commande).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>

                          {/* Liste des produits */}
                          <div className="mb-4">
                            <p className="text-sm font-medium mb-2 text-muted-foreground">Produits :</p>
                            <div className="flex flex-wrap gap-2">
                              {(commande.produits || []).map((p: any, idx: number) => (
                                <span key={idx} className="text-sm bg-muted px-2 py-1 rounded">
                                  {p.nom} × {p.quantite}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="grid md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground mb-1">Client</p>
                              <p className="text-foreground font-medium">{commande.nom_client}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground mb-1">Téléphone</p>
                              <p className="text-foreground font-medium">{commande.telephone}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground mb-1">Total</p>
                              <p className="text-dore font-medium text-lg">
                                {commande.total.toLocaleString('fr-MA')} DH
                              </p>
                            </div>
                          </div>
                          <div className="mt-3 text-sm">
                            <p className="text-muted-foreground">
                              📍 {commande.ville} - {commande.adresse}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(commande.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setSelectedCommande(commande)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Détails de la commande #{commande.id.substring(0, 8)}</DialogTitle>
                              </DialogHeader>
                              {selectedCommande && (
                                <div className="space-y-6">
                                  <div>
                                    <h4 className="font-medium mb-3">Produits commandés</h4>
                                    <div className="space-y-3">
                                      {(selectedCommande.produits || []).map((p: any, idx: number) => (
                                        <div key={idx} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                                          {p.image_url && (
                                            <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-border">
                                              <Image
                                                src={p.image_url}
                                                alt={p.nom}
                                                fill
                                                className="object-cover"
                                                sizes="64px"
                                              />
                                            </div>
                                          )}
                                          <div className="flex-1">
                                            <p className="font-medium">{p.nom}</p>
                                            <p className="text-sm text-muted-foreground">
                                              Quantité: {p.quantite} × {p.prix.toLocaleString('fr-MA')} DH
                                            </p>
                                          </div>
                                          <p className="font-medium text-dore">
                                            {(p.prix * p.quantite).toLocaleString('fr-MA')} DH
                                          </p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                  <div className="pt-4 border-t">
                                    <p className="text-lg font-medium">
                                      Total: <span className="text-dore">{selectedCommande.total.toLocaleString('fr-MA')} DH</span>
                                    </p>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          <Select
                            value={commande.statut}
                            onValueChange={(value) => handleStatutChange(commande.id, value)}
                          >
                            <SelectTrigger className="w-[150px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="En attente">En attente</SelectItem>
                              <SelectItem value="Expédiée">Expédiée</SelectItem>
                              <SelectItem value="Livrée">Livrée</SelectItem>
                              <SelectItem value="Annulée">Annulée</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-4">
          {commandes.map((commande) => (
            <Card key={commande.id} className={`p-6 bg-card border-2 transition-all hover:shadow-lg ${
              commande.statut === 'En attente' ? 'border-yellow-400/50 bg-yellow-50/30' : 'border-border'
            }`}>
              <div className="flex gap-6">
                {/* Produits avec images */}
                <div className="flex gap-2 flex-shrink-0">
                  {(commande.produits || []).slice(0, 3).map((p: any, idx: number) => (
                    <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-border bg-muted">
                      {p.image_url ? (
                        <Image
                          src={p.image_url}
                          alt={p.nom}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                          {p.nom.substring(0, 2)}
                        </div>
                      )}
                    </div>
                  ))}
                  {(commande.produits || []).length > 3 && (
                    <div className="relative w-16 h-16 rounded-lg border border-border bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                      +{(commande.produits || []).length - 3}
                    </div>
                  )}
                </div>

                <div className="flex-1 flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <h3 className="text-xl font-serif">
                        Commande #{commande.id.substring(0, 8)}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatutColor(commande.statut)}`}>
                        {commande.statut}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(commande.date_commande).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    {/* Liste des produits */}
                    <div className="mb-4">
                      <p className="text-sm font-medium mb-2 text-muted-foreground">Produits :</p>
                      <div className="flex flex-wrap gap-2">
                        {(commande.produits || []).map((p: any, idx: number) => (
                          <span key={idx} className="text-sm bg-muted px-2 py-1 rounded">
                            {p.nom} × {p.quantite}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground mb-1">Client</p>
                        <p className="text-foreground font-medium">{commande.nom_client}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Téléphone</p>
                        <p className="text-foreground font-medium">{commande.telephone}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Total</p>
                        <p className="text-dore font-medium text-lg">
                          {commande.total.toLocaleString('fr-MA')} DH
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 text-sm">
                      <p className="text-muted-foreground">
                        📍 {commande.ville} - {commande.adresse}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(commande.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setSelectedCommande(commande)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Détails de la commande #{commande.id.substring(0, 8)}</DialogTitle>
                        </DialogHeader>
                        {selectedCommande && (
                          <div className="space-y-6">
                            <div>
                              <h4 className="font-medium mb-3">Produits commandés</h4>
                              <div className="space-y-3">
                                {(selectedCommande.produits || []).map((p: any, idx: number) => (
                                  <div key={idx} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                                    {p.image_url && (
                                      <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-border">
                                        <Image
                                          src={p.image_url}
                                          alt={p.nom}
                                          fill
                                          className="object-cover"
                                          sizes="64px"
                                        />
                                      </div>
                                    )}
                                    <div className="flex-1">
                                      <p className="font-medium">{p.nom}</p>
                                      <p className="text-sm text-muted-foreground">
                                        Quantité: {p.quantite} × {p.prix.toLocaleString('fr-MA')} DH
                                      </p>
                                    </div>
                                    <p className="font-medium text-dore">
                                      {(p.prix * p.quantite).toLocaleString('fr-MA')} DH
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="pt-4 border-t">
                              <p className="text-lg font-medium">
                                Total: <span className="text-dore">{selectedCommande.total.toLocaleString('fr-MA')} DH</span>
                              </p>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                    <Select
                      value={commande.statut}
                      onValueChange={(value) => handleStatutChange(commande.id, value)}
                    >
                      <SelectTrigger className="w-[150px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="En attente">En attente</SelectItem>
                        <SelectItem value="Expédiée">Expédiée</SelectItem>
                        <SelectItem value="Livrée">Livrée</SelectItem>
                        <SelectItem value="Annulée">Annulée</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

