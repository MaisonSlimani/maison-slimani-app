import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { categoryRepo, supabase } from '@/lib/repositories'
import { Category } from '@maison/domain'


export function useAdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const pathname = location.pathname
  const [loading, setLoading] = useState(true)
  const [counts, setCounts] = useState({
    enAttente: 0,
    expediee: 0,
    livree: 0,
    annulee: 0,
  })
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  
  // Centralized repos from lib/repositories


  const chargerCompteurs = useCallback(async () => {
    try {
      // Parallel status counting via repo find methods (or count methods if we added them)
      // For now using the existing findAll with filtering to stay within GEMINI limits
      const [q1, q2, q3, q4] = await Promise.all([
        supabase.from('commandes').select('*', { count: 'exact', head: true }).eq('status', 'en_attente'),
        supabase.from('commandes').select('*', { count: 'exact', head: true }).eq('status', 'expediee'),
        supabase.from('commandes').select('*', { count: 'exact', head: true }).eq('status', 'livree'),
        supabase.from('commandes').select('*', { count: 'exact', head: true }).eq('status', 'annulee'),
      ])
      setCounts({
        enAttente: q1.count || 0,
        expediee: q2.count || 0,
        livree: q3.count || 0,
        annulee: q4.count || 0,
      })
    } catch (error) {
      console.error('Error fetching counts:', error)
    }
  }, [])

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) navigate('/login')
      else setLoading(false)
    }
    checkAuth()
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) navigate('/login')
    })
    return () => subscription.unsubscribe()
  }, [navigate])

  useEffect(() => {
    if (loading) return
    chargerCompteurs()
    const channel = supabase.channel('layout-counts').on('postgres_changes', { event: '*', schema: 'public', table: 'commandes' }, () => chargerCompteurs()).subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [loading, chargerCompteurs])

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const data = await categoryRepo.findAll()
        setCategories(data)
      } catch (err) {
        console.error('Error fetching categories:', err)
      } finally {
        setLoadingCategories(false)
      }
    }
    if (!loading) fetchCats()
  }, [loading])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return {
    pathname,
    loading,
    counts,
    categories,
    loadingCategories,
    handleLogout
  }
}
