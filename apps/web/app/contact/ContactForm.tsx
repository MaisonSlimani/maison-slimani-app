'use client'

import { ContactFormBody } from '@/components/contact/ContactFormBody'
import { ContactFormSkeleton } from '@/components/contact/ContactFormSkeleton'

import { SiteSettings } from '@/types/index'

interface ContactFormProps {
  settings: SiteSettings
  loading?: boolean
}

export default function ContactForm({ loading = false }: ContactFormProps) {
  if (loading) return <ContactFormSkeleton />

  return <ContactFormBody />
}
