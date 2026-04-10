'use client'

import { ContactCards } from '@/components/contact/ContactCards'
import { ContactFormBody } from '@/components/contact/ContactFormBody'
import { ContactFormSkeleton } from '@/components/contact/ContactFormSkeleton'

import { SiteSettings } from '@/types/index'

interface ContactFormProps {
  settings: SiteSettings
  loading?: boolean
}

export default function ContactForm({ settings, loading = false }: ContactFormProps) {
  if (loading) return <ContactFormSkeleton />

  return (
    <>
      <ContactCards settings={settings} />
      <div className="mt-12">
        <ContactFormBody />
      </div>
    </>
  )
}
