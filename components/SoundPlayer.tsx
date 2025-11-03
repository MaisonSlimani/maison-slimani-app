'use client'

import { useEffect, useRef } from 'react'

interface SoundPlayerProps {
  enabled?: boolean
}

const SoundPlayer = ({ enabled = true }: SoundPlayerProps) => {
  const clickSoundRef = useRef<HTMLAudioElement | null>(null)
  const successSoundRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Créer les éléments audio pour les sons
    try {
      clickSoundRef.current = new Audio('/sounds/click-leather.mp3')
      successSoundRef.current = new Audio('/sounds/add-to-cart.mp3')
      
      // Volume subtil
      if (clickSoundRef.current) clickSoundRef.current.volume = 0.3
      if (successSoundRef.current) successSoundRef.current.volume = 0.3
      
      // Précharger les sons
      if (clickSoundRef.current) clickSoundRef.current.load()
      if (successSoundRef.current) successSoundRef.current.load()
    } catch (error) {
      // Fallback silencieux si les fichiers n'existent pas encore
      console.warn('Sons non disponibles:', error)
    }
  }, [])

  const playClick = () => {
    if (enabled && clickSoundRef.current) {
      try {
        clickSoundRef.current.currentTime = 0
        clickSoundRef.current.play().catch(() => {})
      } catch (error) {
        // Ignorer les erreurs de lecture
      }
    }
  }

  const playSuccess = () => {
    if (enabled && successSoundRef.current) {
      try {
        successSoundRef.current.currentTime = 0
        successSoundRef.current.play().catch(() => {})
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

