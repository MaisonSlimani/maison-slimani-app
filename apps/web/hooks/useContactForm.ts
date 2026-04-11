'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { apiFetch, ENDPOINTS } from '@/lib/api/client'

export function useContactForm() {
  const [envoiEnCours, setEnvoiEnCours] = useState(false)
  const [formData, setFormData] = useState({ nom: '', email: '', telephone: '', message: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setEnvoiEnCours(true)
    try {
      const result = await apiFetch(ENDPOINTS.CONTACT, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(formData) 
      })
      if (!result.success) throw new Error(result.error || 'Erreur')
      toast.success('Message envoyé !'); setFormData({ nom: '', email: '', telephone: '', message: '' })
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : 'Erreur') } finally { setEnvoiEnCours(false) }
  }

  const updateField = (field: string, value: string) => setFormData(prev => ({ ...prev, [field]: value }))

  return { formData, envoiEnCours, handleSubmit, updateField }
}
