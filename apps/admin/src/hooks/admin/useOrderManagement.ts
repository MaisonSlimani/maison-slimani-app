import { useState, useEffect } from 'react'
import { useQueryClient, useQuery } from '@tanstack/react-query'
import { orderRepo, supabase } from '@/lib/repositories'
import { Order } from '@maison/domain'
import { toast } from 'sonner'
import { useOrderAudio } from './useOrderAudio'

export function useOrderManagement(statutSlug: string, statutQuery: string, sortFn: (list: Order[]) => Order[]) {
  const queryClient = useQueryClient()
  const [operationLoading, setOperationLoading] = useState(false)
  const { playNotificationSound } = useOrderAudio()

  const { data: commandes = [], isLoading: loading } = useQuery<Order[]>({
    queryKey: ['admin-commandes', statutSlug],
    queryFn: async () => sortFn(await orderRepo.findAll(statutQuery)),
    staleTime: 60000,
  })

  useEffect(() => {
    const channel = supabase.channel(`cmd-${statutSlug}-${Date.now()}`)
    channel
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'commandes' }, () => {
        playNotificationSound(); queryClient.invalidateQueries({ queryKey: ['admin-commandes'] })
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'commandes' }, () => {
        queryClient.invalidateQueries({ queryKey: ['admin-commandes'] })
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [statutSlug, queryClient, playNotificationSound])

  const updateStatus = async (commandeId: string, nouveauStatut: string) => {
    setOperationLoading(true)
    try {
      const result = await orderRepo.updateStatus(commandeId, nouveauStatut)
      if (!result.success) throw new Error(result.error || 'Erreur')
      toast.success('Statut mis à jour')
      queryClient.invalidateQueries({ queryKey: ['admin-commandes'] })
      window.dispatchEvent(new CustomEvent('orderStatusChanged'))
      return { success: true }
    } catch (error: unknown) { 
      toast.error(error instanceof Error ? error.message : 'Erreur')
      return { success: false }
    } finally { setOperationLoading(false) }
  }

  const deleteOrder = async (commandeId: string) => {
    setOperationLoading(true)
    try {
      const result = await orderRepo.delete(commandeId)
      if (!result.success) throw new Error(result.error || 'Erreur')
      toast.success('Commande supprimée')
      queryClient.invalidateQueries({ queryKey: ['admin-commandes'] })
      window.dispatchEvent(new CustomEvent('orderStatusChanged'))
      return { success: true }
    } catch (error: unknown) { 
      toast.error(error instanceof Error ? error.message : 'Erreur')
      return { success: false }
    } finally { setOperationLoading(false) }
  }

  return { commandes, loading, operationLoading, updateStatus, deleteOrder }
}
