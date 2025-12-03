'use client'

import { useEffect, useRef, useCallback } from 'react'

interface SoundPlayerProps {
  enabled?: boolean
}

const SoundPlayer = ({ enabled = true }: SoundPlayerProps) => {
  const successSoundRef = useRef<HTMLAudioElement | null>(null)
  const hasUserInteracted = useRef(false)

  useEffect(() => {
    // Les sons sont optionnels - le composant fonctionne sans les fichiers
    if (!enabled) return

    // Créer les éléments audio pour les sons
    try {
      successSoundRef.current = new Audio('/sounds/add-to-cart.mp3')
      
      // Volume subtil
      if (successSoundRef.current) successSoundRef.current.volume = 0.3
      
      // Précharger les sons avec gestion d'erreur
      // Note: load() peut ne pas retourner une Promise dans tous les navigateurs
      if (successSoundRef.current) {
        try {
          successSoundRef.current.load()
        } catch {
          // Fichier n'existe pas, on continue silencieusement
          successSoundRef.current = null
        }
      }
    } catch (error) {
      // Fallback silencieux si les fichiers n'existent pas encore
      // Ne pas logger pour éviter les erreurs dans la console
      successSoundRef.current = null
    }

    // Unlock audio on first user interaction
    const unlockAudio = () => {
      if (!hasUserInteracted.current) {
        hasUserInteracted.current = true
        // Try to play a silent sound to unlock audio context
        if (successSoundRef.current) {
          successSoundRef.current.play().catch(() => {
            // Ignore - this is just to unlock the audio context
          })
          successSoundRef.current.pause()
          successSoundRef.current.currentTime = 0
        }
      }
    }

    // Listen for first user interaction
    const events = ['click', 'touchstart', 'keydown']
    events.forEach(event => {
      document.addEventListener(event, unlockAudio, { once: true, passive: true })
    })

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, unlockAudio)
      })
    }
  }, [enabled])

  const playSuccess = useCallback(() => {
    if (enabled && successSoundRef.current && hasUserInteracted.current) {
      try {
        successSoundRef.current.currentTime = 0
        successSoundRef.current.play().catch(() => {
          // Fichier n'existe pas ou erreur de lecture, on ignore silencieusement
        })
      } catch (error) {
        // Ignorer les erreurs de lecture
      }
    }
  }, [enabled])

  // Exposer les méthodes via window pour accès global
  useEffect(() => {
    if (typeof window !== 'undefined') {
      ;(window as any).playSuccessSound = playSuccess
    }
  }, [playSuccess])

  return null
}

export default SoundPlayer

