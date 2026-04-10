import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Input, Label, Card } from '@maison/ui'
import { toast } from 'sonner'
import { supabase } from '@/lib/repositories'

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return

    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      toast.success('Connexion réussie')
      navigate('/')
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#FDFCFB]">
      <Card className="w-full max-w-md p-6 border-none shadow-xl">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-serif">
            Maison <span className="text-[#C5A059]">Slimani</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-2">Administration</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@maisonslimani.com"
              className="border-[#C5A059]/20 focus-visible:ring-[#C5A059]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="border-[#C5A059]/20 focus-visible:ring-[#C5A059]"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#C5A059] text-white hover:bg-[#A6864A]"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </Button>
        </form>
      </Card>
    </div>
  )
}
