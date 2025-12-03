'use client'
import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

export default function PWAProduitRedirectPage() {
  const router = useRouter()
  const params = useParams()
  const categorie = params.categorie as string
  const slug = params.slug as string

  useEffect(() => {
    router.replace(`/boutique/${categorie}/${slug}`)
  }, [router, categorie, slug])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dore mx-auto mb-4"></div>
        <p className="text-muted-foreground">Redirection...</p>
      </div>
    </div>
  )
}
