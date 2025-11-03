'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Eye, Download } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

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
      const supabase = createClient()
      let query = supabase
        .from('commandes')
        .select('*')
        .order('date_commande', { ascending: false })

      if (filtreStatut !== 'tous') {
        query = query.eq('statut', filtreStatut)
      }

      const { data, error } = await query

      if (error) throw error
      setCommandes(data || [])
    } catch (error) {
      console.error('Erreur lors du chargement des commandes:', error)
      toast.error('Erreur lors du chargement des commandes')
    } finally {
      setLoading(false)
    }
  }

  const handleStatutChange = async (commandeId: string, nouveauStatut: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('commandes')
        .update({ statut: nouveauStatut })
        .eq('id', commandeId)

      if (error) throw error
      toast.success('Statut mis à jour')
      chargerCommandes()
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error)
      toast.error('Erreur lors de la mise à jour')
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

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif mb-2">Gestion des commandes</h1>
          <p className="text-ecru/70">Visualisez et gérez toutes les commandes</p>
        </div>
        <Button variant="outline" onClick={handleExportCSV}>
          <Download className="w-4 h-4 mr-2" />
          Exporter CSV
        </Button>
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
      </div>

      <div className="grid gap-4">
        {commandes.map((commande) => (
          <Card key={commande.id} className="p-6 bg-ecru/5 border-ecru/20">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <h3 className="text-xl font-serif">
                    Commande #{commande.id.substring(0, 8)}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    commande.statut === 'Livrée' ? 'bg-green-400/20 text-green-400' :
                    commande.statut === 'Expédiée' ? 'bg-blue-400/20 text-blue-400' :
                    commande.statut === 'En attente' ? 'bg-yellow-400/20 text-yellow-400' :
                    'bg-red-400/20 text-red-400'
                  }`}>
                    {commande.statut}
                  </span>
                </div>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-ecru/70 mb-1">Client</p>
                    <p className="text-ecru">{commande.nom_client}</p>
                  </div>
                  <div>
                    <p className="text-ecru/70 mb-1">Téléphone</p>
                    <p className="text-ecru">{commande.telephone}</p>
                  </div>
                  <div>
                    <p className="text-ecru/70 mb-1">Total</p>
                    <p className="text-dore font-medium">
                      {commande.total.toLocaleString('fr-MA')} DH
                    </p>
                  </div>
                </div>
                <div className="mt-4 text-sm">
                  <p className="text-ecru/70">
                    Date: {new Date(commande.date_commande).toLocaleDateString('fr-FR')}
                  </p>
                  <p className="text-ecru/70">
                    {commande.ville} - {commande.adresse}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 ml-4">
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
                      <DialogTitle>Détails de la commande</DialogTitle>
                    </DialogHeader>
                    {selectedCommande && (
                      <div className="space-y-6">
                        <div>
                          <h4 className="font-medium mb-2">Produits commandés</h4>
                          <div className="space-y-2">
                            {(selectedCommande.produits || []).map((p: any, idx: number) => (
                              <div key={idx} className="flex justify-between">
                                <span>{p.nom} × {p.quantite}</span>
                                <span>{(p.prix * p.quantite).toLocaleString('fr-MA')} DH</span>
                              </div>
                            ))}
                          </div>
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
          </Card>
        ))}
      </div>
    </div>
  )
}

