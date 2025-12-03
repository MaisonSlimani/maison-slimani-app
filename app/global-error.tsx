'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global error:', error)
  }, [error])

  return (
    <html lang="fr">
      <body>
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="p-8 max-w-md text-center">
            <h2 className="text-2xl font-serif mb-4">Une erreur s'est produite</h2>
            <p className="text-muted-foreground mb-6">
              {error.message || 'Une erreur inattendue est survenue'}
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={reset}>Réessayer</Button>
              <Button variant="outline" onClick={() => window.location.href = '/'}>
                Retour à l'accueil
              </Button>
            </div>
          </Card>
        </div>
      </body>
    </html>
  )
}

