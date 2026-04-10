import { useRef, useCallback, useEffect } from 'react'

export function useOrderAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const playNotificationSound = useCallback(() => {
    if (!audioRef.current || audioRef.current.readyState < 2) return
    try {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(() => {})
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    const audio = new Audio('/sounds/new_command.mp3')
    audio.volume = 0.7
    audio.preload = 'auto'
    audio.addEventListener('canplaythrough', () => { audioRef.current = audio })
    audio.addEventListener('error', () => { audioRef.current = null })
    audio.load()
    return () => { audio.pause(); audio.src = '' }
  }, [])

  return { playNotificationSound }
}
