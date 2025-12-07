'use client'
import { useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useRouter } from 'next/navigation'

export default function PWACategorieRedirectPage() {
  const params = useParams()
  const router = useRouter()
  const categorie = params.categorie as string

  useEffect(() => {
    // Redirect immediately without showing anything
    if (typeof window !== 'undefined' && categorie) {
      router.replace(`/boutique/${categorie}`)
    }
  }, [categorie, router])

  // Return null to show nothing while redirecting
  return null
}
