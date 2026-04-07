import React, { useEffect, useRef } from 'react';

// Ultra-lightweight CSS-only sakura petals — NO JS animation loop, NO RAF
// Pure CSS keyframes = zero JS overhead = smooth 60fps always
const PETALS = Array.from({ length: 10 }, (_, i) => ({
  id: i,
  left: `${5 + (i * 9.3) % 95}%`,
  size: 10 + (i * 3.7) % 12,
  delay: `${(i * 0.7) % 6}s`,
  duration: `${6 + (i * 1.3) % 5}s`,
  drift: `${((i % 2 === 0 ? 1 : -1) * (20 + (i * 11) % 60))}px`,
  color: ['#FFB7C5','#FF6B9D','#FFCDD2','#F48FB1','#FCE4EC','#FF80AB'][i % 6],
  rotation: `${180 + i * 72}deg`,
}));

export const SakuraPetals: React.FC = () => (
  <>
    <style>{`
      @keyframes ks-petal {
        0%   { transform: translateY(-30px) translateX(0) rotate(0deg); opacity: 0; }
        8%   { opacity: 0.8; }
        85%  { opacity: 0.55; }
        100% { transform: translateY(105vh) translateX(var(--drift)) rotate(var(--rot)); opacity: 0; }
      }
    `}</style>
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 1 }} aria-hidden="true">
      {PETALS.map(p => (
        <div key={p.id} style={{
          position: 'absolute', top: 0, left: p.left,
          width: p.size, height: p.size,
          animationName: 'ks-petal',
          animationDuration: p.duration,
          animationDelay: p.delay,
          animationTimingFunction: 'linear',
          animationIterationCount: 'infinite',
          animationFillMode: 'both',
          '--drift': p.drift,
          '--rot': p.rotation,
          willChange: 'transform',
        } as React.CSSProperties}>
          <svg viewBox="0 0 30 30" width={p.size} height={p.size}>
            <g transform="translate(15,15)">
              {[0,72,144,216,288].map(r => (
                <ellipse key={r} rx="6" ry="11" fill={p.color} opacity="0.82"
                  transform={`rotate(${r}) translate(0,-9)`}/>
              ))}
              <circle r="3" fill="white" opacity="0.55"/>
            </g>
          </svg>
        </div>
      ))}
    </div>
  </>
);
