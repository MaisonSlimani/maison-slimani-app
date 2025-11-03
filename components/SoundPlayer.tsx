'use client'

import { useEffect, useRef } from 'react'

interface SoundPlayerProps {
  enabled?: boolean
}

const SoundPlayer = ({ enabled = true }: SoundPlayerProps) => {
  const clickSoundRef = useRef<HTMLAudioElement | null>(null)
  const successSoundRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Les sons sont optionnels - le composant fonctionne sans les fichiers
    if (!enabled) return

    // Créer les éléments audio pour les sons
    try {
      clickSoundRef.current = new Audio('/sounds/click-leather.mp3')
      successSoundRef.current = new Audio('/sounds/add-to-cart.mp3')
      
      // Volume subtil
      if (clickSoundRef.current) clickSoundRef.current.volume = 0.3
      if (successSoundRef.current) successSoundRef.current.volume = 0.3
      
      // Précharger les sons avec gestion d'erreur
      // Note: load() peut ne pas retourner une Promise dans tous les navigateurs
      if (clickSoundRef.current) {
        try {
          clickSoundRef.current.load()
        } catch {
          // Fichier n'existe pas, on continue silencieusement
          clickSoundRef.current = null
        }
      }
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
      clickSoundRef.current = null
      successSoundRef.current = null
    }
  }, [enabled])

  const playClick = () => {
    if (enabled && clickSoundRef.current) {
      try {
        clickSoundRef.current.currentTime = 0
        clickSoundRef.current.play().catch(() => {
          // Fichier n'existe pas ou erreur de lecture, on ignore silencieusement
        })
      } catch (error) {
        // Ignorer les erreurs de lecture
      }
    }
  }

  const playSuccess = () => {
    if (enabled && successSoundRef.current) {
      try {
        successSoundRef.current.currentTime = 0
        successSoundRef.current.play().catch(() => {
          // Fichier n'existe pas ou erreur de lecture, on ignore silencieusement
        })
      } catch (error) {
        // Ignorer les erreurs de lecture
      }
    }
  }

  // Exposer les méthodes via window pour accès global
  useEffect(() => {
    if (typeof window !== 'undefined') {
      ;(window as any).playClickSound = playClick
      ;(window as any).playSuccessSound = playSuccess
    }
  }, [enabled])

  return null
}

export default SoundPlayer

