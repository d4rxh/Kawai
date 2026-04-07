import React, { useEffect, useRef } from 'react';
import { usePlayerStore } from '../store/playerStore';

export const AudioVisualizer: React.FC = () => {
  const { isPlaying } = usePlayerStore();
  const barsRef = useRef<(HTMLDivElement | null)[]>([]);
  const animRef = useRef<number>(0);
  const BARS = 28;

  useEffect(() => {
    if (!isPlaying) {
      barsRef.current.forEach(b => { if (b) b.style.height = '4px'; });
      cancelAnimationFrame(animRef.current);
      return;
    }

    const animate = () => {
      barsRef.current.forEach((bar, i) => {
        if (!bar) return;
        // Pseudo-random wave based on time + bar index
        const t = Date.now() / 1000;
        const h = 4 + Math.abs(
          Math.sin(t * 2.5 + i * 0.6) * 16 +
          Math.sin(t * 1.7 + i * 1.1) * 10 +
          Math.sin(t * 3.3 + i * 0.3) * 8
        );
        bar.style.height = `${Math.min(h, 36)}px`;
      });
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [isPlaying]);

  return (
    <div className="flex items-center justify-center gap-[3px] w-full h-10" aria-hidden="true">
      {Array.from({ length: BARS }, (_, i) => (
        <div
          key={i}
          ref={el => { barsRef.current[i] = el; }}
          className="rounded-full transition-none"
          style={{
            width: 3,
            height: 4,
            minHeight: 4,
            background: i < BARS / 2
              ? `linear-gradient(to top, #C2185B, #FF6B9D)`
              : `linear-gradient(to top, #FF6B9D, #FFB7C5)`,
            opacity: isPlaying ? 1 : 0.3,
            transition: isPlaying ? 'none' : 'opacity 0.4s',
          }}
        />
      ))}
    </div>
  );
};
