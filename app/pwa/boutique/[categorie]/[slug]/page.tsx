'use client'
import { useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useRouter } from 'next/navigation'

export default function PWAProduitRedirectPage() {
  const params = useParams()
  const router = useRouter()
  const categorie = params.categorie as string
  const slug = params.slug as string

  useEffect(() => {
    // Redirect immediately without showing anything
    if (typeof window !== 'undefined' && categorie && slug) {
      // Use router.replace for instant client-side redirect (faster than window.location)
      router.replace(`/boutique/${categorie}/${slug}`)
    }
  }, [categorie, slug, router])

  // Return null to show nothing while redirecting
  return null
}
