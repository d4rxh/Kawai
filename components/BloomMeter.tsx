import React from 'react';
import { usePlayerStore } from '../store/playerStore';

const STAGES = [
  { min: 0,  max: 10,  label: 'Seed 🌱',      desc: 'Abhi sunna shuru karo' },
  { min: 10, max: 25,  label: 'Sprout 🌿',     desc: 'Thodi growth ho rahi hai' },
  { min: 25, max: 45,  label: 'Bud 🌸',        desc: 'Flower aane wala hai!' },
  { min: 45, max: 65,  label: 'Bloom 🌺',      desc: 'Sakura khil raha hai!' },
  { min: 65, max: 85,  label: 'Full Bloom 🌸🌸', desc: 'Puri tarah khil gaya!' },
  { min: 85, max: 100, label: 'Sakura Forest 🌸🌳', desc: 'Tum asli Sakura fan ho!' },
];

export const BloomMeter: React.FC = () => {
  const { bloomLevel, totalListeningSeconds, badges } = usePlayerStore();
  const stage = STAGES.find(s => bloomLevel >= s.min && bloomLevel <= s.max) || STAGES[0];
  const pct = Math.min(100, bloomLevel);

  // Draw simple SVG sakura tree based on bloom level
  const petals = Math.floor(pct / 14);

  return (
    <div className="bg-[#130018] rounded-2xl p-5 border border-[#FF6B9D]/10">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">🌸</span>
        <div>
          <p className="text-white font-bold text-sm">Bloom Meter</p>
          <p className="text-[#D4A0BA] text-xs">Sunne se tree grow karti hai</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-[#FF6B9D] font-black text-xl">{pct}%</p>
          <p className="text-[#D4A0BA] text-[10px]">{stage.label}</p>
        </div>
      </div>

      {/* SVG Sakura Tree */}
      <div className="flex justify-center mb-4">
        <svg width="140" height="120" viewBox="0 0 140 120">
          {/* Trunk */}
          <rect x="67" y="75" width="6" height="35" rx="3" fill="#8B4513" opacity="0.8"/>
          {/* Branches */}
          {pct > 5 && <line x1="70" y1="80" x2="45" y2="60" stroke="#8B4513" strokeWidth="3" strokeLinecap="round" opacity="0.7"/>}
          {pct > 10 && <line x1="70" y1="80" x2="95" y2="60" stroke="#8B4513" strokeWidth="3" strokeLinecap="round" opacity="0.7"/>}
          {pct > 20 && <line x1="70" y1="70" x2="35" y2="50" stroke="#8B4513" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>}
          {pct > 30 && <line x1="70" y1="70" x2="105" y2="50" stroke="#8B4513" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>}
          {pct > 40 && <line x1="70" y1="65" x2="70" y2="40" stroke="#8B4513" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>}

          {/* Sakura flower clusters */}
          {pct > 10 && [...Array(Math.max(0,petals))].map((_, i) => {
            const positions = [
              [45,55],[95,55],[35,45],[105,45],[70,35],
              [55,42],[85,42],[40,35],[100,35],[60,25],
              [80,25],[70,18],[50,30],[90,30]
            ];
            const [px, py] = positions[i] || [70,35];
            return (
              <g key={i} transform={`translate(${px},${py})`}>
                {[0,72,144,216,288].map(r => (
                  <ellipse key={r} rx="5" ry="8" fill="#FF6B9D" opacity="0.8"
                    transform={`rotate(${r}) translate(0,-6)`}/>
                ))}
                <circle r="3" fill="#FFB7C5" opacity="0.9"/>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Progress Bar */}
      <div className="relative h-2.5 bg-[#2A0038] rounded-full overflow-hidden mb-2">
        <div className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#C2185B,#FF6B9D,#FFB7C5)' }} />
      </div>
      <div className="flex justify-between text-[10px] text-[#D4A0BA]/50">
        <span>{stage.desc}</span>
        <span>{Math.floor(totalListeningSeconds/3600)}h sune</span>
      </div>

      {/* Badges */}
      {badges.length > 0 && (
        <div className="mt-4 pt-3 border-t border-[#FF6B9D]/10">
          <p className="text-white/50 text-[10px] mb-2 font-bold tracking-wide">BADGES</p>
          <div className="flex flex-wrap gap-2">
            {badges.map((b,i) => (
              <span key={i} className="text-xs bg-[#FF6B9D]/15 border border-[#FF6B9D]/25 text-[#FFB7C5] px-2.5 py-1 rounded-full">
                {b}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
