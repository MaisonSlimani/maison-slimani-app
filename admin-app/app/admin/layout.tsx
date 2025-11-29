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
  const [categories, setCategories] = useState<Array<{ slug: string; nom: string }>>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const commandesEnAttenteRef = useRef(0)

  useEffect(() => {
    commandesEnAttenteRef.current = commandesEnAttente
  }, [commandesEnAttente])

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

  const adjustPendingCount = useCallback((delta: number) => {
    setCommandesEnAttente((prev) => Math.max(0, prev + delta))
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

  // Charger le nombre de commandes en attente avec real-time et notifications globales
  useEffect(() => {
    if (loading) return

    const supabase = createClient()

    const chargerCommandesEnAttente = async (retryCount = 0) => {
      if (retryCount > 3) {
        console.error('Échec après 3 tentatives de chargement des commandes en attente')
        setCommandesEnAttente(0)
        return
      }

      try {
        const encodedStatut = encodeURIComponent('En attente')
        
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000)
        
        const response = await fetch(`/api/admin/commandes?statut=${encodedStatut}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        })
        
        clearTimeout(timeoutId)
        
        if (!response.ok) {
          if (response.status === 401) {
            console.warn('Non autorisé pour charger les commandes en attente')
            setCommandesEnAttente(0)
            return
          }
          
          const errorText = await response.text()
          console.error('Erreur API:', response.status, errorText)
          
          if (response.status >= 500 || retryCount < 2) {
            await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)))
            return chargerCommandesEnAttente(retryCount + 1)
          }
          
          throw new Error(`Erreur lors du chargement des commandes en attente: ${response.status}`)
        }
        
        const result = await response.json()
        const commandes = result.data || []
        setCommandesEnAttente(commandes.length)
      } catch (error: any) {
        if (error?.name === 'AbortError' || error?.message?.includes('aborted')) {
          if (retryCount < 2) {
            await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)))
            return chargerCommandesEnAttente(retryCount + 1)
          }
        }
        
        console.error('Erreur lors du chargement des commandes en attente:', error)
        setCommandesEnAttente(0)
      }
    }

    chargerCommandesEnAttente()

    const channel = supabase
      .channel('commandes-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'commandes' },
        (payload) => {
          const nouvelleCommande = payload.new as any
          if (nouvelleCommande?.statut !== 'En attente') {
            return
          }

          adjustPendingCount(1)
          playGlobalNotificationSound()
          toast.success(`Nouvelle commande reçue !`, {
            description: `Commande #${nouvelleCommande.id?.substring(0, 8) || 'N/A'} - ${
              nouvelleCommande.nom_client || 'Client'
            }`,
          })
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'commandes' },
        (payload) => {
          const nouvelleStatut = payload.new?.statut
          const ancienStatut = payload.old?.statut
          const etaitEnAttente = ancienStatut === 'En attente'
          const estEnAttente = nouvelleStatut === 'En attente'

          if (etaitEnAttente === estEnAttente) {
            return
          }

          adjustPendingCount(estEnAttente ? 1 : -1)
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'commandes' },
        (payload) => {
          const ancienneCommande = payload.old as any
          if (ancienneCommande?.statut === 'En attente') {
            adjustPendingCount(-1)
          }
        }
      )
      .subscribe((status, err) => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.warn('⚠️ Problème avec le canal real-time (layout):', err)
          chargerCommandesEnAttente()
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [loading, adjustPendingCount, playGlobalNotificationSound])

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

