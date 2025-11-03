import { useEffect, useRef } from 'react';

interface SoundPlayerProps {
  enabled?: boolean;
}

const SoundPlayer = ({ enabled = true }: SoundPlayerProps) => {
  const clickSoundRef = useRef<HTMLAudioElement | null>(null);
  const successSoundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio elements for sounds
    clickSoundRef.current = new Audio('data:audio/wav;base64,UklGRhQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=');
    successSoundRef.current = new Audio('data:audio/wav;base64,UklGRhQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=');
    
    // Set volume to subtle level
    if (clickSoundRef.current) clickSoundRef.current.volume = 0.15;
    if (successSoundRef.current) successSoundRef.current.volume = 0.2;
  }, []);

  const playClick = () => {
    if (enabled && clickSoundRef.current) {
      clickSoundRef.current.currentTime = 0;
      clickSoundRef.current.play().catch(() => {});
    }
  };

  const playSuccess = () => {
    if (enabled && successSoundRef.current) {
      successSoundRef.current.currentTime = 0;
      successSoundRef.current.play().catch(() => {});
    }
  };

  // Expose methods through window for global access
  useEffect(() => {
    (window as any).playClickSound = playClick;
    (window as any).playSuccessSound = playSuccess;
  }, [enabled]);

  return null;
};

export default SoundPlayer;
