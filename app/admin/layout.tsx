'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  Truck,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [loading, setLoading] = useState(true)
  const [produitsExpanded, setProduitsExpanded] = useState(false)
  const [commandesExpanded, setCommandesExpanded] = useState(false)
  const [commandesEnAttente, setCommandesEnAttente] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const lastCommandeIdsRef = useRef<Set<string>>(new Set())

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

  // Initialiser l'audio pour la notification globale
  useEffect(() => {
    try {
      audioRef.current = new Audio('/sounds/new_command.mp3')
      audioRef.current.volume = 0.7
      audioRef.current.preload = 'auto'
      audioRef.current.load()
      console.log('✅ Audio global initialisé dans le layout')
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation audio:', error)
    }
  }, [])

  // Charger le nombre de commandes en attente avec real-time et notifications globales
  useEffect(() => {
    const supabase = createClient()
    const chargerCommandesEnAttente = async (silent = false) => {
      try {
        const response = await fetch('/api/admin/commandes?statut=En attente')
        if (response.ok) {
          const result = await response.json()
          const commandes = result.data || []
          
          // Détecter les nouvelles commandes pour notification globale (polling fallback)
          // Vérifier même en mode silent (polling) pour détecter les nouvelles commandes
          const nouvellesCommandesIds = new Set<string>(
            (commandes as Array<{ id: string }>).map((c) => String(c.id))
          )
          const anciennesCommandesIds = lastCommandeIdsRef.current
          
          // Si on a déjà des IDs enregistrés, comparer pour trouver les nouvelles
          // (Seulement si real-time n'a pas déjà déclenché la notification)
          if (anciennesCommandesIds.size > 0) {
            const commandesNouvelles = commandes.filter(
              (c: any) => !anciennesCommandesIds.has(String(c.id))
            )
            
            if (commandesNouvelles.length > 0) {
              console.log('🆕 Nouvelles commandes détectées via polling (layout):', commandesNouvelles.length, commandesNouvelles)
              
              // Jouer le son (même en mode silent/polling) - fallback si real-time n'a pas fonctionné
              if (audioRef.current) {
                try {
                  audioRef.current.currentTime = 0
                  audioRef.current.play().catch(err => {
                    console.error('❌ Erreur lors de la lecture du son:', err)
                  })
                } catch (error) {
                  console.error('❌ Erreur lors de la préparation du son:', error)
                }
              }
              
              // Afficher notification (même en mode silent/polling) - fallback si real-time n'a pas fonctionné
              toast.success(`Nouvelle commande reçue !`, {
                description: `${commandesNouvelles.length} commande(s) en attente`,
              })
            }
          }
          
          // Mettre à jour les IDs (même si c'était la première fois, pour la prochaine fois)
          lastCommandeIdsRef.current = nouvellesCommandesIds
          setCommandesEnAttente(commandes.length)
        }
      } catch (error) {
        console.error('Erreur lors du chargement des commandes en attente:', error)
      }
    }

    if (!loading) {
      // Initialiser lastCommandeIdsRef avec un Set vide pour permettre la détection
      if (lastCommandeIdsRef.current.size === 0) {
        // Ne pas initialiser ici, laisser le premier appel charger les IDs
      }
      
      // Charger initialement (pas en mode silent pour initialiser les IDs)
      chargerCommandesEnAttente(false)
      
      // Configurer l'abonnement en temps réel pour les nouvelles commandes
      // Utiliser un nom de canal simple et stable
      const channel = supabase
        .channel('commandes-realtime')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'commandes',
          },
          (payload) => {
            const nouvelleCommande = payload.new as any
            console.log('🆕 Nouvelle commande détectée via real-time:', nouvelleCommande)
            
            // Jouer le son
            if (audioRef.current) {
              try {
                audioRef.current.currentTime = 0
                audioRef.current.play().catch(err => {
                  console.error('❌ Erreur lors de la lecture du son:', err)
                })
              } catch (error) {
                console.error('❌ Erreur lors de la préparation du son:', error)
              }
            }
            
            // Afficher notification (une seule fois)
            toast.success(`Nouvelle commande reçue !`, {
              description: `Commande #${nouvelleCommande.id?.substring(0, 8) || 'N/A'} - ${nouvelleCommande.nom_client || 'Client'}`,
            })
            
            // Recharger le nombre de commandes en attente
            chargerCommandesEnAttente()
          }
        )
        .subscribe((status) => {
          console.log('Layout: Statut real-time:', status)
          if (status === 'SUBSCRIBED') {
            console.log('✅ Abonnement real-time actif (layout)')
          } else if (status === 'CHANNEL_ERROR') {
            console.error('❌ Erreur de canal real-time (layout)')
          } else if (status === 'TIMED_OUT') {
            console.warn('⚠️ Abonnement real-time timeout (layout)')
          } else if (status === 'CLOSED') {
            console.warn('⚠️ Canal real-time fermé (layout)')
          }
        })

      // Polling de secours pour détecter les nouvelles commandes
      // (au cas où real-time INSERT events ne fonctionnent pas)
      const pollingInterval = setInterval(() => {
        console.log('🔍 Polling (layout): Vérification des nouvelles commandes...')
        chargerCommandesEnAttente(true) // Silent mode pour le polling
      }, 5000) // Vérifier toutes les 5 secondes
      
      return () => {
        clearInterval(pollingInterval)
        supabase.removeChannel(channel)
      }
    }
  }, [loading])

  // Auto-expand si on est sur une page de catégorie
  useEffect(() => {
    if (pathname?.startsWith('/admin/produits') || pathname === '/admin/produits') {
      setProduitsExpanded(true)
    }
    if (pathname?.startsWith('/admin/commandes') || pathname === '/admin/commandes') {
      setCommandesExpanded(true)
    }
    if (pathname === '/admin/categories' || pathname?.startsWith('/admin/categories/')) {
      setProduitsExpanded(true) // Expander Produits car Catégories est accessible depuis là
    }
  }, [pathname])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
    }
  }

  // Définir les constantes avant le return conditionnel
  const categories = [
    { slug: 'classiques', nom: 'Classiques', icon: Package },
    { slug: 'cuirs-exotiques', nom: 'Cuirs Exotiques', icon: Package },
    { slug: 'editions-limitees', nom: 'Éditions Limitées', icon: Package },
    { slug: 'nouveautes', nom: 'Nouveautés', icon: Package },
  ]

  const menuItems = [
    { href: '/admin', label: 'Tableau de bord', icon: LayoutDashboard },
    { href: '/admin/parametres', label: 'Paramètres', icon: Settings },
  ]

  const statutsCommandes = [
    { slug: 'en-attente', nom: 'En attente', icon: AlertCircle },
    { slug: 'expediee', nom: 'Expédiée', icon: Truck },
    { slug: 'livree', nom: 'Livrée', icon: CheckCircle },
    { slug: 'annulee', nom: 'Annulée', icon: XCircle },
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Chargement...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex h-screen">
        {/* Sidebar */}
        <aside className="w-64 bg-card border-r border-border flex flex-col shadow-lg">
          <div className="p-6 border-b border-border">
            <h1 className="text-2xl font-serif">
              Maison <span className="text-dore">Slimani</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Administration</p>
          </div>

          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
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
                      ? 'bg-dore/20 text-dore border border-dore/30 font-medium'
                      : 'text-foreground/80 hover:text-foreground hover:bg-accent/50'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              )
            })}

            {/* Menu Commandes avec sous-catégories */}
            <div className="space-y-1">
              <button
                onClick={() => setCommandesExpanded(!commandesExpanded)}
                className={cn(
                  'w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-colors',
                  pathname?.startsWith('/admin/commandes')
                    ? 'bg-dore/20 text-dore border border-dore/30 font-medium'
                    : 'text-foreground/80 hover:text-foreground hover:bg-accent/50'
                )}
              >
                <div className="flex items-center gap-3">
                  <ShoppingBag className="w-5 h-5" />
                  <span>Commandes</span>
                </div>
                {commandesExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>

              <AnimatePresence>
                {commandesExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="pl-4 space-y-1 pt-2">
                      <Link
                        href="/admin/commandes"
                        className={cn(
                          'flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors',
                          pathname === '/admin/commandes'
                            ? 'bg-dore/10 text-dore font-medium'
                            : 'text-foreground/70 hover:text-foreground hover:bg-accent/30'
                        )}
                      >
                        <span>Toutes les catégories</span>
                      </Link>
                      <Link
                        href="/admin/commandes/toutes"
                        className={cn(
                          'flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors',
                          pathname === '/admin/commandes/toutes'
                            ? 'bg-dore/10 text-dore font-medium'
                            : 'text-foreground/70 hover:text-foreground hover:bg-accent/30'
                        )}
                      >
                        <span>Toutes les commandes</span>
                      </Link>
                      {statutsCommandes.map((statut) => {
                        const StatutIcon = statut.icon
                        const isActive = pathname === `/admin/commandes/${statut.slug}`
                        const isEnAttente = statut.slug === 'en-attente'
                        return (
                          <Link
                            key={statut.slug}
                            href={`/admin/commandes/${statut.slug}`}
                            className={cn(
                              'flex items-center justify-between gap-3 px-4 py-2 rounded-lg text-sm transition-colors',
                              isActive
                                ? 'bg-dore/10 text-dore font-medium'
                                : 'text-foreground/70 hover:text-foreground hover:bg-accent/30'
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <StatutIcon className="w-4 h-4" />
                              <span>{statut.nom}</span>
                            </div>
                            {isEnAttente && commandesEnAttente > 0 && (
                              <span className="px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">
                                {commandesEnAttente}
                              </span>
                            )}
                          </Link>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Menu Produits avec sous-catégories */}
            <div className="space-y-1">
              <button
                onClick={() => setProduitsExpanded(!produitsExpanded)}
                className={cn(
                  'w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-colors',
                  pathname?.startsWith('/admin/produits') || pathname === '/admin/categories'
                    ? 'bg-dore/20 text-dore border border-dore/30 font-medium'
                    : 'text-foreground/80 hover:text-foreground hover:bg-accent/50'
                )}
              >
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5" />
                  <span>Produits</span>
                </div>
                {produitsExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>

              <AnimatePresence>
                {produitsExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="pl-4 space-y-1 pt-2">
                      <Link
                        href="/admin/produits"
                        className={cn(
                          'flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors',
                          pathname === '/admin/produits'
                            ? 'bg-dore/10 text-dore font-medium'
                            : 'text-foreground/70 hover:text-foreground hover:bg-accent/30'
                        )}
                      >
                        <span>Tous les produits</span>
                      </Link>
                      {categories.map((categorie) => {
                        const isActive = pathname === `/admin/produits/${categorie.slug}`
                        return (
                          <Link
                            key={categorie.slug}
                            href={`/admin/produits/${categorie.slug}`}
                            className={cn(
                              'flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors',
                              isActive
                                ? 'bg-dore/10 text-dore font-medium'
                                : 'text-foreground/70 hover:text-foreground hover:bg-accent/30'
                            )}
                          >
                            <span>{categorie.nom}</span>
                          </Link>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>

          <div className="p-4 border-t border-border">
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start text-foreground/80 hover:text-foreground hover:bg-accent/50"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Déconnexion
            </Button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto bg-background">
          <div className="p-8">{children}</div>
        </main>
      </div>
    </div>
  )
}

