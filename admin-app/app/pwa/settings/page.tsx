'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { registerPushNotifications, unregisterPushNotifications, getPushTokenStatus } from '@/lib/push-notifications'

export default function AdminPWASettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState(false)
  const [pushNotificationLoading, setPushNotificationLoading] = useState(false)
  const [pushTokenStatus, setPushTokenStatus] = useState<{ registered: boolean; token?: string; device_type?: string }>({ registered: false })
  const [settings, setSettings] = useState({
    email_entreprise: '',
    telephone: '',
    adresse: '',
    description: '',
  })

  useEffect(() => {
    const verifierSession = async () => {
      try {
        const response = await fetch('/api/auth/session')
        const data = await response.json()
        if (!data.authenticated) {
          router.push('/login')
          return
        }
      } catch (error) {
        router.push('/login')
        return
      }
    }

    verifierSession()
    chargerSettings()
    chargerPushStatus()
  }, [router])

  const chargerSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/settings')
      if (!response.ok) throw new Error('Erreur')
      const result = await response.json()
      if (result.data) {
        setSettings({
          email_entreprise: result.data.email_entreprise || '',
          telephone: result.data.telephone || '',
          adresse: result.data.adresse || '',
          description: result.data.description || '',
        })
      }
    } catch (error) {
      toast.error('Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  const chargerPushStatus = async () => {
    try {
      const status = await getPushTokenStatus()
      setPushTokenStatus(status)
      setPushNotificationsEnabled(status.registered)
    } catch (error) {
      console.error('Erreur lors du chargement du statut push:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (saving) return

    setSaving(true)
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })

      if (!response.ok) {
        let errorMessage = 'Erreur lors de la sauvegarde'
        try {
          const contentType = response.headers.get('content-type')
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json()
            errorMessage = errorData.error || errorMessage
          }
        } catch {
          // If parsing fails, use default error message
        }
        throw new Error(errorMessage)
      }
      
      toast.success('Paramètres sauvegardés')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const handlePushNotificationToggle = async (checked: boolean) => {
    setPushNotificationLoading(true)
    try {
      if (checked) {
        // Register
        await registerPushNotifications()
        toast.success('Notifications push activées')
        // Refresh status after a short delay
        setTimeout(async () => {
          const status = await getPushTokenStatus()
          setPushTokenStatus(status)
          setPushNotificationsEnabled(status.registered)
        }, 2000)
      } else {
        // Unregister
        await unregisterPushNotifications()
        toast.success('Notifications push désactivées')
        setPushNotificationsEnabled(false)
        setPushTokenStatus({ registered: false })
      }
    } catch (error) {
      console.error('Erreur lors de la modification des notifications push:', error)
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la modification des notifications push')
      // Revert checkbox state
      setPushNotificationsEnabled(!checked)
    } finally {
      setPushNotificationLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="w-full">
        <div className="px-4 py-8 text-center text-muted-foreground">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="w-full">
      
      <div className="px-4 py-6 space-y-6 max-w-md mx-auto">
        <h1 className="text-2xl font-serif text-foreground">Paramètres</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Card className="p-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email_entreprise">Email entreprise</Label>
              <Input
                id="email_entreprise"
                type="email"
                value={settings.email_entreprise}
                onChange={(e) => setSettings({ ...settings, email_entreprise: e.target.value })}
                placeholder="exemple@email.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telephone">Téléphone</Label>
              <Input
                id="telephone"
                type="tel"
                value={settings.telephone}
                onChange={(e) => setSettings({ ...settings, telephone: e.target.value })}
                placeholder="Numéro de téléphone"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="adresse">Adresse</Label>
              <Input
                id="adresse"
                value={settings.adresse}
                onChange={(e) => setSettings({ ...settings, adresse: e.target.value })}
                placeholder="Adresse complète"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={settings.description}
                onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                placeholder="Description..."
                rows={4}
              />
            </div>

            <div className="pt-4 border-t space-y-2">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="push_notifications"
                  checked={pushNotificationsEnabled}
                  onCheckedChange={handlePushNotificationToggle}
                  disabled={pushNotificationLoading}
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label htmlFor="push_notifications" className="cursor-pointer">
                    Notifications push (Nouveaux commandes)
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    {pushTokenStatus.registered 
                      ? `Activé${pushTokenStatus.device_type ? ` (${pushTokenStatus.device_type})` : ' (web)'}`
                      : 'Désactivé - Activez pour recevoir des notifications sur votre navigateur'}
                  </p>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={saving}
              className="w-full bg-dore text-charbon hover:bg-dore/90"
            >
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </Button>
          </Card>
        </form>
      </div>
    </div>
  )
}

