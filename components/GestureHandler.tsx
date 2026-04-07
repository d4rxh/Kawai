import React, { useEffect } from 'react';
import { usePlayerStore } from '../store/playerStore';

// Shake to skip + Volume swipe + Keyboard shortcuts
export const GestureHandler: React.FC = () => {
  const { nextSong, prevSong, togglePlay, setVolume, volume } = usePlayerStore();

  // Shake to skip
  useEffect(() => {
    if (!('DeviceMotionEvent' in window)) return;
    let lastX = 0, lastTime = 0;
    const handleMotion = (e: DeviceMotionEvent) => {
      const acc = e.accelerationIncludingGravity;
      if (!acc) return;
      const now = Date.now();
      const x = Math.abs(acc.x || 0);
      if (x > 18 && now - lastTime > 1000) {
        if ((acc.x || 0) > 0) nextSong();
        else prevSong();
        lastTime = now;
        // Haptic
        if ('vibrate' in navigator) navigator.vibrate([20, 10, 20]);
      }
      lastX = x;
    };
    window.addEventListener('devicemotion', handleMotion, { passive: true });
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [nextSong, prevSong]);

  // Volume swipe on non-interactive area
  useEffect(() => {
    let touchStartY = 0;
    let touchStartX = 0;
    const handleTouchStart = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      // Only on main content, not on interactive elements
      if (target.closest('button, input, a, [role="slider"]')) return;
      touchStartY = e.touches[0].clientY;
      touchStartX = e.touches[0].clientX;
    };
    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartY) return;
      const dy = touchStartY - e.changedTouches[0].clientY;
      const dx = Math.abs(touchStartX - e.changedTouches[0].clientX);
      // Only vertical swipes on left edge (volume zone)
      if (touchStartX < 40 && Math.abs(dy) > 40 && dx < 30) {
        const delta = dy > 0 ? 0.1 : -0.1;
        const newVol = Math.max(0, Math.min(1, volume + delta));
        setVolume(newVol);
        if ('vibrate' in navigator) navigator.vibrate(10);
      }
      touchStartY = 0;
    };
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [volume, setVolume]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.code === 'Space') { e.preventDefault(); togglePlay(); }
      if (e.code === 'ArrowRight') nextSong();
      if (e.code === 'ArrowLeft')  prevSong();
      if (e.code === 'ArrowUp')   { e.preventDefault(); setVolume(Math.min(1, volume + 0.1)); }
      if (e.code === 'ArrowDown') { e.preventDefault(); setVolume(Math.max(0, volume - 0.1)); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [togglePlay, nextSong, prevSong, volume, setVolume]);

  return null;
};
