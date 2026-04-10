import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { orderRepo, productRepo } from '@/lib/repositories'
import { DashboardService, IDashboardMetrics } from '@maison/domain'

export function useDashboardStats() {
  // Logic setup
  const dashboardService = new DashboardService()

  const { data, isLoading, refetch, error } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: async () => {
      // Parallel data fetching via centralized repos
      const [commandes, produits] = await Promise.all([
        orderRepo.findAll(),
        productRepo.findAll(),
      ])

      // Delegation of calculation to Domain Service
      const metrics: IDashboardMetrics = dashboardService.calculateMetrics(commandes, produits)
      
      return {
        commandes,
        produits,
        stats: metrics
      }
    },
    staleTime: 60000,
  })

  useEffect(() => {
    if (error) {
      toast.error('Erreur lors du chargement des statistiques')
      console.error('Dashboard Stats Error:', error)
    }
  }, [error])

  return {
    data,
    loading: isLoading,
    refetch
  }
}
