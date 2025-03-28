import { useCallback } from 'react';

export function useSound() {
  const playCardSound = useCallback(() => {
    try {
      const audio = new Audio('sounds/confirm.mp3');
      audio.volume = 0.5;
      audio.play().catch(error => {
        console.log('Ses çalınamadı:', error);
      });
    } catch (error) {
      console.log('Ses yüklenemedi:', error);
    }
  }, []);

  const playConfirmSound = useCallback(() => {
    try {
      const audio = new Audio('sounds/confirm.mp3');
      audio.volume = 0.3;
      audio.play().catch(error => {
        console.log('Ses çalınamadı:', error);
      });
    } catch (error) {
      console.log('Ses yüklenemedi:', error);
    }
  }, []);

  return {
    playCardSound,
    playConfirmSound
  };
} 