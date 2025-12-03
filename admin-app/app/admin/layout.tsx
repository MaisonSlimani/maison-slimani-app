'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState, useRef, useCallback } from 'react'
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
  TrendingUp,
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
  const [commandesExpediees, setCommandesExpediees] = useState(0)
  const [commandesLivrees, setCommandesLivrees] = useState(0)
  const [commandesAnnulees, setCommandesAnnulees] = useState(0)
  const [categories, setCategories] = useState<Array<{ slug: string; nom: string }>>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const commandesEnAttenteRef = useRef(0)
  const commandesExpedieesRef = useRef(0)
  const commandesLivreesRef = useRef(0)
  const commandesAnnuleesRef = useRef(0)

  useEffect(() => {
    commandesEnAttenteRef.current = commandesEnAttente
  }, [commandesEnAttente])
  useEffect(() => {
    commandesExpedieesRef.current = commandesExpediees
  }, [commandesExpediees])
  useEffect(() => {
    commandesLivreesRef.current = commandesLivrees
  }, [commandesLivrees])
  useEffect(() => {
    commandesAnnuleesRef.current = commandesAnnulees
  }, [commandesAnnulees])

  const playGlobalNotificationSound = useCallback(() => {
    if (!audioRef.current) return
    try {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch((err) => {
        console.error('❌ Erreur lors de la lecture du son:', err)
      })
    } catch (error) {
      console.error('❌ Erreur lors de la préparation du son:', error)
    }
  }, [])


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

  // Register for push notifications when authenticated
  useEffect(() => {
    if (!loading) {
      import('@/lib/push-notifications').then(({ registerPushNotifications }) => {
        registerPushNotifications().catch((error) => {
          console.error('Error registering push notifications:', error)
        })
      })
    }
  }, [loading])

  // Charger les compteurs de commandes par statut avec real-time
  useEffect(() => {
    if (loading) return

    const supabase = createClient()

    const chargerCompteurs = async () => {
      try {
        const [enAttenteRes, expedieeRes, livreeRes, annuleeRes] = await Promise.all([
          fetch(`/api/admin/commandes?statut=${encodeURIComponent('En attente')}`),
          fetch(`/api/admin/commandes?statut=${encodeURIComponent('Expédiée')}`),
          fetch(`/api/admin/commandes?statut=${encodeURIComponent('Livrée')}`),
          fetch(`/api/admin/commandes?statut=${encodeURIComponent('Annulée')}`),
        ])

        if (enAttenteRes.ok) {
          const data = await enAttenteRes.json()
          setCommandesEnAttente((data.data || []).length)
        }
        if (expedieeRes.ok) {
          const data = await expedieeRes.json()
          setCommandesExpediees((data.data || []).length)
        }
        if (livreeRes.ok) {
          const data = await livreeRes.json()
          setCommandesLivrees((data.data || []).length)
        }
        if (annuleeRes.ok) {
          const data = await annuleeRes.json()
          setCommandesAnnulees((data.data || []).length)
        }
      } catch (error) {
        console.error('Erreur lors du chargement des compteurs:', error)
      }
    }

    chargerCompteurs()

    // Listen for manual status change events to refresh counts
    const handleStatusChange = () => {
      // Small delay to ensure database is updated
      setTimeout(() => {
        chargerCompteurs()
      }, 500)
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('orderStatusChanged', handleStatusChange)
    }

    const channel = supabase
      .channel('commandes-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'commandes' },
        (payload) => {
          const nouvelleCommande = payload.new as any
          const statut = nouvelleCommande?.statut
          
          if (statut === 'En attente') {
            setCommandesEnAttente(prev => prev + 1)
            playGlobalNotificationSound()
            toast.success(`Nouvelle commande reçue !`, {
              description: `Commande #${nouvelleCommande.id?.substring(0, 8) || 'N/A'} - ${
                nouvelleCommande.nom_client || 'Client'
              }`,
            })
          } else if (statut === 'Expédiée') {
            setCommandesExpediees(prev => prev + 1)
          } else if (statut === 'Livrée') {
            setCommandesLivrees(prev => prev + 1)
          } else if (statut === 'Annulée') {
            setCommandesAnnulees(prev => prev + 1)
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'commandes' },
        (payload) => {
          const ancienStatut = payload.old?.statut
          const nouveauStatut = payload.new?.statut

          if (ancienStatut === nouveauStatut) return

          // If old status is available, update counts directly
          if (ancienStatut && nouveauStatut) {
            // Decrement old status
            if (ancienStatut === 'En attente') {
              setCommandesEnAttente(prev => Math.max(0, prev - 1))
            } else if (ancienStatut === 'Expédiée') {
              setCommandesExpediees(prev => Math.max(0, prev - 1))
            } else if (ancienStatut === 'Livrée') {
              setCommandesLivrees(prev => Math.max(0, prev - 1))
            } else if (ancienStatut === 'Annulée') {
              setCommandesAnnulees(prev => Math.max(0, prev - 1))
            }

            // Increment new status
            if (nouveauStatut === 'En attente') {
              setCommandesEnAttente(prev => prev + 1)
            } else if (nouveauStatut === 'Expédiée') {
              setCommandesExpediees(prev => prev + 1)
            } else if (nouveauStatut === 'Livrée') {
              setCommandesLivrees(prev => prev + 1)
            } else if (nouveauStatut === 'Annulée') {
              setCommandesAnnulees(prev => prev + 1)
            }
          } else {
            // If old status is not available, refresh all counts
            chargerCompteurs()
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'commandes' },
        (payload) => {
          const ancienneCommande = payload.old as any
          const statut = ancienneCommande?.statut

          if (statut === 'En attente') {
            setCommandesEnAttente(prev => Math.max(0, prev - 1))
          } else if (statut === 'Expédiée') {
            setCommandesExpediees(prev => Math.max(0, prev - 1))
          } else if (statut === 'Livrée') {
            setCommandesLivrees(prev => Math.max(0, prev - 1))
          } else if (statut === 'Annulée') {
            setCommandesAnnulees(prev => Math.max(0, prev - 1))
          }
        }
      )
      .subscribe((status, err) => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.warn('⚠️ Problème avec le canal real-time (layout):', err)
          chargerCompteurs()
        }
      })

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('orderStatusChanged', handleStatusChange)
      }
      supabase.removeChannel(channel)
    }
  }, [loading, playGlobalNotificationSound])

  // Charger les catégories depuis la base de données
  useEffect(() => {
    const chargerCategories = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('categories')
          .select('nom, slug')
          .eq('active', true)
          .order('ordre', { ascending: true })

        if (error) throw error

        setCategories((data || []).map(cat => ({
          slug: cat.slug,
          nom: cat.nom,
        })))
      } catch (error) {
        console.error('Erreur lors du chargement des catégories:', error)
        setCategories([])
      } finally {
        setLoadingCategories(false)
      }
    }

    if (!loading) {
      chargerCategories()
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
      setProduitsExpanded(true)
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

  const menuItems = [
    { href: '/admin', label: 'Tableau de bord', icon: LayoutDashboard },
    { href: '/admin/upsells', label: 'Upsells', icon: TrendingUp },
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
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-card border-r border-border flex flex-col shadow-lg h-full">
          <div className="p-6 border-b border-border flex-shrink-0">
            <h1 className="text-2xl font-serif">
              Maison <span className="text-dore">Slimani</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Administration</p>
          </div>

          <nav className="flex-1 p-4 space-y-2 overflow-y-auto overflow-x-hidden min-h-0">
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
                        
                        // Get count and badge color for each status
                        let count = 0
                        let badgeClass = ''
                        if (statut.slug === 'en-attente') {
                          count = commandesEnAttente
                          badgeClass = 'bg-yellow-100 text-yellow-700'
                        } else if (statut.slug === 'expediee') {
                          count = commandesExpediees
                          badgeClass = 'bg-blue-100 text-blue-700'
                        } else if (statut.slug === 'livree') {
                          count = commandesLivrees
                          badgeClass = 'bg-green-100 text-green-700'
                        } else if (statut.slug === 'annulee') {
                          count = commandesAnnulees
                          badgeClass = 'bg-red-100 text-red-700'
                        }
                        
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
                            {count > 0 && (
                              <span className={cn('px-2 py-0.5 text-xs font-medium rounded-full', badgeClass)}>
                                {count}
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
                        href="/admin/categories"
                        className={cn(
                          'flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors',
                          pathname === '/admin/categories' || pathname?.startsWith('/admin/categories/')
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'text-primary/80 hover:text-primary hover:bg-primary/10'
                        )}
                      >
                        <span>Tous les catégories</span>
                      </Link>
                      <div className="space-y-1">
                        <Link
                          href="/admin/produits"
                          className={cn(
                            'flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors',
                            pathname === '/admin/produits' && !pathname?.startsWith('/admin/produits/')
                              ? 'bg-dore/10 text-dore font-medium'
                              : 'text-foreground/70 hover:text-foreground hover:bg-accent/30'
                          )}
                        >
                          <span>Tous les produits</span>
                        </Link>
                        {loadingCategories ? (
                          <div className="pl-4 pr-4 py-2 text-sm text-muted-foreground">Chargement...</div>
                        ) : categories.length > 0 ? (
                          <div className="pl-4 space-y-1">
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
                        ) : null}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>

          <div className="p-4 border-t border-border space-y-2 flex-shrink-0">
            <Link
              href="/admin/parametres"
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors w-full',
                pathname === '/admin/parametres'
                  ? 'bg-dore/20 text-dore border border-dore/30 font-medium'
                  : 'text-foreground/80 hover:text-foreground hover:bg-accent/50'
              )}
            >
              <Settings className="w-5 h-5" />
              <span>Paramètres</span>
            </Link>
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

