'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ShoppingBag, DollarSign, MapPin, TrendingUp, Package, Clock, CheckCircle, AlertCircle, ArrowRight, AlertTriangle, Warehouse } from 'lucide-react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalCommandes: 0,
    totalRevenus: 0,
    commandesEnAttente: 0,
    villesUniques: 0,
    commandesLivrees: 0,
    revenusMois: 0,
    produitsTotal: 0,
    produitsRuptureStock: 0,
    produitsStockFaible: 0,
    totalStock: 0,
  })
  const [loading, setLoading] = useState(true)
  const [dernieresCommandes, setDernieresCommandes] = useState<any[]>([])
  const [produits, setProduits] = useState<any[]>([])
  const [produitsRuptureStock, setProduitsRuptureStock] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const supabase = createClient()

  const playDashboardNotification = useCallback((commande?: any) => {
    // Use setTimeout to avoid calling toast during render
    setTimeout(() => {
      if (audioRef.current) {
        try {
          audioRef.current.currentTime = 0
          audioRef.current.play().catch((err) => {
            console.error('❌ Erreur lors de la lecture du son (dashboard):', err)
          })
        } catch (error) {
          console.error('❌ Erreur lors de la préparation du son (dashboard):', error)
        }
      }

      const shortId = commande?.id ? commande.id.substring(0, 8) : 'N/A'
      toast.success('Nouvelle commande reçue !', {
        description: `Commande #${shortId} - ${commande?.nom_client || 'Client'}`,
      })
    }, 0)
  }, [])

  // Initialiser l'audio pour la notification
  useEffect(() => {
    audioRef.current = new Audio('/sounds/new_command.mp3')
    audioRef.current.volume = 0.7
  }, [])

  useEffect(() => {
    chargerCategories()
    chargerStats()
    
    // Configurer l'abonnement en temps réel
    const channelName = `commandes-changes-dashboard-${Date.now()}`
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'commandes',
        },
        (payload) => {
          console.log('Changement détecté sur le dashboard:', payload)

          if (payload.eventType === 'INSERT') {
            playDashboardNotification(payload.new)
          }

          if (
            payload.eventType === 'INSERT' ||
            payload.eventType === 'UPDATE' ||
            payload.eventType === 'DELETE'
          ) {
            chargerStats()
          }
        }
      )
      .subscribe((status) => {
        console.log('Statut de l\'abonnement real-time (dashboard):', status)
        if (status === 'SUBSCRIBED') {
          console.log('✅ Abonnement real-time actif (dashboard)')
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Erreur de canal real-time (dashboard)')
        } else if (status === 'TIMED_OUT') {
          console.warn('⚠️ Abonnement real-time timeout (dashboard)')
        } else if (status === 'CLOSED') {
          console.warn('⚠️ Canal real-time fermé (dashboard)')
        }
      })

    // Nettoyer l'abonnement au démontage
    return () => {
      console.log('Nettoyage de l\'abonnement real-time (dashboard)')
      supabase.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase, playDashboardNotification])

  const chargerCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories')
      if (!response.ok) return
      
      const result = await response.json()
      setCategories(result.data || [])
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error)
    }
  }

  const chargerStats = async (silent = false) => {
    try {
      // Charger les commandes via l'API admin
      const [commandesResponse, produitsResponse] = await Promise.all([
        fetch('/api/admin/commandes?statut=tous'),
        fetch('/api/admin/produits'),
      ])
      
      if (!commandesResponse.ok) {
        const errorData = await commandesResponse.json().catch(() => ({ error: 'Erreur inconnue' }))
        const errorMessage = errorData.error || errorData.details || 'Erreur lors du chargement des commandes'
        console.error('Erreur API commandes:', {
          status: commandesResponse.status,
          statusText: commandesResponse.statusText,
          error: errorMessage,
        })
        
        if (!silent) {
          throw new Error(errorMessage)
        }
        // En mode silencieux, continuer avec des données vides
      }

      const commandesResult = await commandesResponse.json().catch(() => ({ data: [] }))
      const commandes = commandesResult.data || []

      // Charger les produits
      let produitsData: any[] = []
      if (produitsResponse.ok) {
        const produitsResult = await produitsResponse.json()
        produitsData = produitsResult.data || []
      }

      // Calculer les statistiques
      const totalCommandes = commandes.length || 0
      // Revenus totaux - seulement pour les commandes livrées
      const totalRevenus = commandes
        .filter((c: any) => c.statut === 'Livrée')
        .reduce((acc: number, c: any) => acc + parseFloat(c.total || 0), 0) || 0
      const commandesEnAttente = commandes.filter((c: any) => c.statut === 'En attente').length || 0
      const commandesLivrees = commandes.filter((c: any) => c.statut === 'Livrée').length || 0
      const villesUniques = new Set(commandes.map((c: any) => c.ville)).size || 0
      const produitsTotal = produitsData.length || 0
      
      // Statistiques de stock (account for products with colors)
      const produitsRuptureStockList = produitsData.filter((p: any) => {
        if (p.has_colors && p.couleurs && Array.isArray(p.couleurs)) {
          // For products with colors, check if total stock across all colors is 0
          const totalStock = p.couleurs.reduce((sum: number, c: any) => sum + (c.stock || 0), 0)
          return totalStock === 0
        }
        // For products without colors, check the stock field
        return (p.stock || 0) === 0
      }) || []
      const produitsRuptureStock = produitsRuptureStockList.length || 0
      
      const produitsStockFaible = produitsData.filter((p: any) => {
        let totalStock = 0
        if (p.has_colors && p.couleurs && Array.isArray(p.couleurs)) {
          totalStock = p.couleurs.reduce((sum: number, c: any) => sum + (c.stock || 0), 0)
        } else {
          totalStock = p.stock || 0
        }
        return totalStock > 0 && totalStock <= 5
      }).length || 0
      
      const totalStock = produitsData.reduce((acc: number, p: any) => {
        if (p.has_colors && p.couleurs && Array.isArray(p.couleurs)) {
          return acc + p.couleurs.reduce((sum: number, c: any) => sum + (c.stock || 0), 0)
        }
        return acc + (p.stock || 0)
      }, 0) || 0

      // Revenus du mois actuel
      const maintenant = new Date()
      const debutMois = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1)
      const revenusMois = commandes
        .filter((c: any) => {
          const dateCommande = new Date(c.date_commande)
          return dateCommande >= debutMois && c.statut === 'Livrée'
        })
        .reduce((acc: number, c: any) => acc + parseFloat(c.total || 0), 0) || 0

      // Dernières commandes (5 plus récentes)
      const dernieres = commandes
        .sort((a: any, b: any) => new Date(b.date_commande).getTime() - new Date(a.date_commande).getTime())
        .slice(0, 5)

      setStats({
        totalCommandes,
        totalRevenus,
        commandesEnAttente,
        villesUniques,
        commandesLivrees,
        revenusMois,
        produitsTotal,
        produitsRuptureStock,
        produitsStockFaible,
        totalStock,
      })
      setDernieresCommandes(dernieres)
      setProduits(produitsData)
      setProduitsRuptureStock(produitsRuptureStockList)
    } catch (error: any) {
      console.error('Erreur lors du chargement des statistiques:', error)
      
      // Si c'est une erreur d'authentification, rediriger vers la page de connexion
      if (error?.message?.includes('Non autorisé') || error?.message?.includes('401')) {
        if (!silent) {
          toast.error('Session expirée. Redirection vers la connexion...')
          setTimeout(() => {
            window.location.href = '/login'
          }, 1500)
        }
        return
      }
      
      if (!silent) {
        const errorMessage = error?.message || error?.error || 'Erreur lors du chargement des statistiques'
        toast.error(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>Chargement...</div>
  }

  const metrics = [
    {
      label: 'Commandes totales',
      value: stats.totalCommandes,
      icon: ShoppingBag,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Revenus totaux',
      value: `${stats.totalRevenus.toLocaleString('fr-MA')} DH`,
      icon: DollarSign,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Revenus ce mois',
      value: `${stats.revenusMois.toLocaleString('fr-MA')} DH`,
      icon: TrendingUp,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'En attente',
      value: stats.commandesEnAttente,
      icon: Clock,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
    },
    {
      label: 'Livrées',
      value: stats.commandesLivrees,
      icon: CheckCircle,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-50',
    },
    {
      label: 'Produits',
      value: stats.produitsTotal,
      icon: Package,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-50',
    },
    {
      label: 'Villes',
      value: stats.villesUniques,
      icon: MapPin,
      color: 'text-pink-500',
      bgColor: 'bg-pink-50',
    },
    {
      label: 'Total stock',
      value: stats.totalStock,
      icon: Warehouse,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Rupture de stock',
      value: stats.produitsRuptureStock,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      label: 'Stock faible (≤5)',
      value: stats.produitsStockFaible,
      icon: AlertCircle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ]

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case 'En attente':
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">En attente</span>
      case 'Expédiée':
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">Expédiée</span>
      case 'Livrée':
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">Livrée</span>
      case 'Annulée':
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">Annulée</span>
      default:
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">{statut}</span>
    }
  }

  // Grouper les métriques par catégorie
  const metricsArgent = metrics.filter(m => m.label.includes('Revenus') || m.label.includes('DH'))
  const metricsCommandes = metrics.filter(m => m.label.includes('Commande') || m.label.includes('Livrée') || m.label.includes('attente'))
  const metricsStock = metrics.filter(m => m.label.toLowerCase().includes('stock') || m.label.includes('Rupture') || m.label.includes('faible'))
  const metricsAutres = metrics.filter(m => !metricsArgent.includes(m) && !metricsCommandes.includes(m) && !metricsStock.includes(m))

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif mb-2">Tableau de bord</h1>
          <p className="text-muted-foreground">Vue d'ensemble de votre activité</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/produits">
              <Package className="w-4 h-4 mr-2" />
              Produits
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/commandes">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Commandes
            </Link>
          </Button>
        </div>
      </div>

      {/* Rangée 1: Indicateurs financiers */}
      <div>
        <h2 className="text-xl font-serif mb-4 text-foreground/80">Revenus et finances</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {metricsArgent.map((metric, index) => {
            const Icon = metric.icon
            return (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`p-6 bg-card border-border hover:shadow-lg transition-shadow ${metric.bgColor}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg ${metric.bgColor}`}>
                      <Icon className={`w-6 h-6 ${metric.color}`} />
                    </div>
                  </div>
                  <p className="text-3xl font-serif mb-1 font-bold">{metric.value}</p>
                  <p className="text-sm text-muted-foreground font-medium">{metric.label}</p>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Rangée 2: Indicateurs de commandes */}
      <div>
        <h2 className="text-xl font-serif mb-4 text-foreground/80">Commandes et livraisons</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {metricsCommandes.map((metric, index) => {
            const Icon = metric.icon
            // Déterminer le lien selon la métrique
            let linkHref = '/admin/commandes'
            if (metric.label === 'En attente') {
              linkHref = '/admin/commandes/en-attente'
            } else if (metric.label === 'Livrées') {
              linkHref = '/admin/commandes/livree'
            } else if (metric.label === 'Commandes totales') {
              linkHref = '/admin/commandes/toutes'
            }
            
            return (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <Link href={linkHref}>
                  <Card className={`p-6 bg-card border-border hover:shadow-lg transition-all cursor-pointer hover:scale-105 ${metric.bgColor}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-lg ${metric.bgColor}`}>
                        <Icon className={`w-6 h-6 ${metric.color}`} />
                      </div>
                    </div>
                    <p className="text-3xl font-serif mb-1 font-bold">{metric.value}</p>
                    <p className="text-sm text-muted-foreground font-medium">{metric.label}</p>
                  </Card>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Rangée 3: Gestion du stock */}
      <div>
        <h2 className="text-xl font-serif mb-4 text-foreground/80">Gestion du stock</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {metricsStock.map((metric, index) => {
            const Icon = metric.icon
            return (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
              >
                <Card className={`p-6 bg-card border-border hover:shadow-lg transition-shadow ${metric.bgColor} ${
                  metric.label.includes('Rupture') || metric.label.includes('faible') ? 'border-2 border-red-300' : ''
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg ${metric.bgColor}`}>
                      <Icon className={`w-6 h-6 ${metric.color}`} />
                    </div>
                  </div>
                  <p className="text-3xl font-serif mb-1 font-bold">{metric.value}</p>
                  <p className="text-sm text-muted-foreground font-medium">{metric.label}</p>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Rangée 4: Autres informations */}
      <div>
        <h2 className="text-xl font-serif mb-4 text-foreground/80">Autres informations</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {metricsAutres.map((metric, index) => {
            const Icon = metric.icon
            return (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
              >
                <Card className={`p-6 bg-card border-border hover:shadow-lg transition-shadow ${metric.bgColor}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg ${metric.bgColor}`}>
                      <Icon className={`w-6 h-6 ${metric.color}`} />
                    </div>
                  </div>
                  <p className="text-3xl font-serif mb-1 font-bold">{metric.value}</p>
                  <p className="text-sm text-muted-foreground font-medium">{metric.label}</p>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Dernières commandes et alertes */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Dernières commandes */}
        <Card className="p-6 bg-card border-border">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-serif">Dernières commandes</h2>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/commandes">
                Voir tout <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
          {dernieresCommandes.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune commande récente</p>
          ) : (
            <div className="space-y-3">
              {dernieresCommandes.map((commande: any, index: number) => (
                <motion.div
                  key={commande.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm">#{commande.id.substring(0, 8)}</p>
                      {getStatutBadge(commande.statut)}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{commande.nom_client}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(commande.date_commande).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-dore">{commande.total.toLocaleString('fr-MA')} DH</p>
                    <p className="text-xs text-muted-foreground">
                      {(commande.produits || []).length} article{(commande.produits || []).length > 1 ? 's' : ''}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </Card>

        {/* Alertes */}
        <Card className="p-6 bg-card border-border">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-serif">Alertes</h2>
            <AlertCircle className="w-5 h-5 text-yellow-500" />
          </div>
          <div className="space-y-3">
            {stats.produitsRuptureStock > 0 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-3 bg-red-50 border border-red-200 rounded-lg"
              >
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <p className="font-medium text-sm text-red-700">Rupture de stock</p>
                </div>
                <p className="text-xs text-red-600 mb-2">
                  {stats.produitsRuptureStock} produit{stats.produitsRuptureStock > 1 ? 's' : ''} en rupture de stock
                </p>
                <div className="space-y-1.5">
                  {produitsRuptureStock.slice(0, 3).map((produit: any) => {
                    // Mapper le nom de catégorie au slug depuis les catégories chargées
                    const foundCategory = categories.find((cat: any) => cat.nom === produit.categorie)
                    const categorieSlug = foundCategory?.slug || 'tous'
                    const produitLink = `/admin/produits/${categorieSlug}`
                    
                    return (
                      <Link key={produit.id} href={produitLink}>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full justify-start text-xs text-red-600 hover:text-red-700 hover:bg-red-100 h-auto py-1.5 px-2"
                        >
                          <ArrowRight className="w-3 h-3 mr-1.5" />
                          <span className="truncate">{produit.nom}</span>
                        </Button>
                      </Link>
                    )
                  })}
                  {produitsRuptureStock.length > 3 && (
                    <Button asChild variant="ghost" size="sm" className="w-full text-xs text-red-600 hover:text-red-700 hover:bg-red-100">
                      <Link href="/admin/produits">
                        Voir {produitsRuptureStock.length - 3} autre{produitsRuptureStock.length - 3 > 1 ? 's' : ''}...
                      </Link>
                    </Button>
                  )}
                </div>
              </motion.div>
            )}
            {stats.produitsStockFaible > 0 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-3 bg-orange-50 border border-orange-200 rounded-lg"
              >
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="w-4 h-4 text-orange-600" />
                  <p className="font-medium text-sm text-orange-700">Stock faible</p>
                </div>
                <p className="text-xs text-orange-600">
                  {stats.produitsStockFaible} produit{stats.produitsStockFaible > 1 ? 's' : ''} avec stock faible (≤5)
                </p>
                <Button asChild variant="ghost" size="sm" className="mt-2 text-orange-600 hover:text-orange-700 hover:bg-orange-100">
                  <Link href="/admin/produits">Voir les produits</Link>
                </Button>
              </motion.div>
            )}
            {stats.commandesEnAttente > 0 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
              >
                <Clock className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-sm text-yellow-900">
                    {stats.commandesEnAttente} commande{stats.commandesEnAttente > 1 ? 's' : ''} en attente
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    Nécessite votre attention
                  </p>
                </div>
              </motion.div>
            )}
            {stats.produitsTotal === 0 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
                className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg"
              >
                <Package className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-sm text-blue-900">
                    Aucun produit enregistré
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    Commencez par ajouter vos premiers produits
                  </p>
                </div>
              </motion.div>
            )}
            {stats.commandesEnAttente === 0 && stats.produitsTotal > 0 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg"
              >
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-sm text-green-900">
                    Tout est à jour
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    Aucune action requise
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}

