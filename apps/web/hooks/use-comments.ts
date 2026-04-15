import { useState, useEffect, useCallback } from 'react'
import { Commentaire } from '@/types/index'
import { toast } from 'sonner'

export function useComments(productId: string, sort: string, onUpdate?: () => void) {
  const [comments, setComments] = useState<Commentaire[]>([])
  const [loading, setLoading] = useState(true)

  const fetchComments = useCallback(async () => {
    setLoading(true)
    try {
      const resp = await fetch(`/api/v1/commentaires?productId=${productId}&sort=${sort}`)
      const data = await resp.json()
      if (data.success) {
        setComments(data.data || [])
      }
    } catch { 
      toast.error('Erreur de chargement') 
    } finally { 
      setLoading(false) 
    }
  }, [productId, sort])

  useEffect(() => { 
    fetchComments() 
  }, [fetchComments])

  const handleDelete = async (id: string) => {
    try {
      const resp = await fetch(`/api/v1/commentaires/${id}`, { method: 'DELETE' })
      if (resp.ok) {
        toast.success('Supprimé')
        fetchComments()
        onUpdate?.()
        return true
      }
    } catch { 
      toast.error('Erreur suppression') 
    }
    return false
  }

  const handleUpdate = async (id: string, data: Partial<Commentaire>) => {
    try {
      const resp = await fetch(`/api/v1/commentaires/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (resp.ok) {
        toast.success('Commentaire mis à jour')
        fetchComments()
        onUpdate?.()
        return true
      }
    } catch { 
      toast.error('Erreur mise à jour') 
    }
    return false
  }

  return {
    comments,
    loading,
    fetchComments,
    handleDelete,
    handleUpdate
  }
}
