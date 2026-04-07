import React, { useEffect, useRef, useState } from 'react';
import { usePlayerStore } from '../store/playerStore';

export type BgType = 'none' | 'aurora' | 'rain' | 'galaxy' | 'lofi' | 'fireflies';

const BG_LABELS: Record<BgType, { label: string; emoji: string }> = {
  none:      { label: 'Off',        emoji: '⬛' },
  aurora:    { label: 'Aurora',     emoji: '🌌' },
  rain:      { label: 'Rain',       emoji: '🌧️' },
  galaxy:    { label: 'Galaxy',     emoji: '✨' },
  lofi:      { label: 'Lo-fi City', emoji: '🏙️' },
  fireflies: { label: 'Fireflies',  emoji: '✨' },
};

/* ── Aurora ── */
const AuroraBg: React.FC = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
    <style>{`
      @keyframes aurora1{0%,100%{transform:translateX(-10%) scale(1.1) rotate(0deg)}50%{transform:translateX(10%) scale(1.3) rotate(8deg)}}
      @keyframes aurora2{0%,100%{transform:translateX(10%) scale(1.2) rotate(0deg)}50%{transform:translateX(-10%) scale(1) rotate(-6deg)}}
      @keyframes aurora3{0%,100%{transform:translateY(5%) scale(1.1)}50%{transform:translateY(-5%) scale(1.25)}}
    `}</style>
    {[
      { c: 'rgba(255,107,157,0.18)', a: 'aurora1', d: '8s', w: '90%', l: '-20%', t: '-10%' },
      { c: 'rgba(168,85,247,0.15)',  a: 'aurora2', d: '11s', w: '80%', l: '30%',  t: '20%' },
      { c: 'rgba(6,182,212,0.12)',   a: 'aurora3', d: '9s',  w: '70%', l: '0%',   t: '40%' },
    ].map((s, i) => (
      <div key={i} className="absolute rounded-full" style={{
        width: s.w, aspectRatio: '3/1',
        background: `radial-gradient(ellipse,${s.c},transparent 70%)`,
        filter: 'blur(40px)',
        left: s.l, top: s.t,
        animation: `${s.a} ${s.d} ease-in-out infinite`,
        animationDelay: `${i * 2}s`,
      }}/>
    ))}
  </div>
);

/* ── Rain ── */
const RainBg: React.FC = () => {
  const drops = Array.from({ length: 40 }, (_, i) => ({
    left: `${(i * 2.5) % 100}%`,
    delay: `${(i * 0.12) % 2}s`,
    dur:   `${0.6 + (i % 5) * 0.1}s`,
    h:     `${12 + (i % 8) * 4}px`,
    op:    0.15 + (i % 4) * 0.08,
  }));
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      <style>{`@keyframes rainDrop{0%{transform:translateY(-20px);opacity:0}20%{opacity:var(--op)}80%{opacity:var(--op)}100%{transform:translateY(110vh);opacity:0}}`}</style>
      {drops.map((d, i) => (
        <div key={i} className="absolute w-px rounded-full"
          style={{ left: d.left, top: 0, height: d.h, background: 'rgba(150,200,255,0.6)',
            animation: `rainDrop ${d.dur} linear ${d.delay} infinite`,
            '--op': d.op } as any} />
      ))}
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 0%,rgba(6,182,212,0.08),transparent 60%)' }}/>
    </div>
  );
};

/* ── Galaxy ── */
const GalaxyBg: React.FC = () => {
  const stars = Array.from({ length: 80 }, (_, i) => ({
    x: `${(i * 1.27 + 5) % 100}%`, y: `${(i * 1.73 + 3) % 100}%`,
    s: 1 + (i % 3) * 0.8,
    delay: `${(i * 0.3) % 4}s`,
    dur: `${2 + (i % 4)}s`,
  }));
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      <style>{`@keyframes twinkle{0%,100%{opacity:0.1;transform:scale(1)}50%{opacity:0.9;transform:scale(1.3)}}`}</style>
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 30% 40%,rgba(99,102,241,0.12),transparent 60%), radial-gradient(ellipse at 70% 60%,rgba(168,85,247,0.1),transparent 50%)' }}/>
      {stars.map((s, i) => (
        <div key={i} className="absolute rounded-full bg-white"
          style={{ left: s.x, top: s.y, width: s.s, height: s.s,
            animation: `twinkle ${s.dur} ease-in-out ${s.delay} infinite` }}/>
      ))}
    </div>
  );
};

/* ── Lo-fi City ── */
const LofiCityBg: React.FC = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
    <style>{`
      @keyframes cityGlow{0%,100%{opacity:0.6}50%{opacity:1}}
      @keyframes window{0%,100%{opacity:0.3}50%{opacity:0.8}}
    `}</style>
    <div className="absolute inset-0" style={{ background: 'linear-gradient(to top,rgba(255,107,157,0.12) 0%,transparent 40%)' }}/>
    <svg className="absolute bottom-0 left-0 right-0 w-full" height="160" viewBox="0 0 400 160" preserveAspectRatio="none">
      {[[20,120,30],[60,90,20],[100,140,35],[150,80,25],[190,110,28],[230,95,22],[270,130,32],[310,85,20],[350,115,30],[380,100,18]].map(([x,h,w],i)=>(
        <g key={i}>
          <rect x={x} y={160-h} width={w} height={h} fill={`rgba(${20+i*3},${5+i*2},${30+i*4},0.9)`}/>
          {Array.from({length:Math.floor(h/18)},(_,j)=>
            <rect key={j} x={x+4} y={160-h+8+j*16} width={6} height={8} fill="rgba(255,220,100,0.5)" style={{animation:`window ${2+j*0.3}s ease-in-out ${j*0.4}s infinite`}}/>
          )}
        </g>
      ))}
    </svg>
    <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 100%,rgba(255,107,157,0.15),transparent 50%)', animation: 'cityGlow 4s ease-in-out infinite' }}/>
  </div>
);

/* ── Fireflies ── */
const FirefliesBg: React.FC = () => {
  const flies = Array.from({ length: 25 }, (_, i) => ({
    x: `${(i * 4.1 + 5) % 90}%`, y: `${(i * 3.7 + 8) % 85}%`,
    dur: `${3 + (i % 4)}s`, delay: `${(i * 0.4) % 5}s`,
    dx: `${((i % 7) - 3) * 30}px`, dy: `${((i % 5) - 2) * 25}px`,
    color: ['#FF6B9D','#A855F7','#06B6D4','#F59E0B','#10B981'][i % 5],
  }));
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      <style>{`@keyframes fly{0%{transform:translate(0,0);opacity:0}20%{opacity:0.9}80%{opacity:0.7}100%{transform:translate(var(--dx),var(--dy));opacity:0}}`}</style>
      {flies.map((f, i) => (
        <div key={i} className="absolute rounded-full" style={{
          left: f.x, top: f.y, width: 5, height: 5,
          background: f.color, boxShadow: `0 0 8px 2px ${f.color}`,
          animation: `fly ${f.dur} ease-in-out ${f.delay} infinite alternate`,
          '--dx': f.dx, '--dy': f.dy,
        } as any}/>
      ))}
    </div>
  );
};

/* ── Selector button ── */
export const AnimatedBgSelector: React.FC = () => {
  const { animatedBg, setAnimatedBg } = usePlayerStore() as any;
  const current = (animatedBg as BgType) || 'none';
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold transition-all ${current !== 'none' ? 'border-[#FF6B9D]/40 bg-[#FF6B9D]/10 text-[#FF6B9D]' : 'border-white/10 text-white/50 hover:text-white'}`}>
        {BG_LABELS[current].emoji} {BG_LABELS[current].label}
      </button>
      {open && (
        <div className="absolute top-full mt-2 left-0 bg-[#130018] border border-[#FF6B9D]/20 rounded-2xl p-2 z-50 flex flex-col gap-1 shadow-xl min-w-[140px]" onClick={e => e.stopPropagation()}>
          {(Object.keys(BG_LABELS) as BgType[]).map(bg => (
            <button key={bg} onClick={() => { setAnimatedBg(bg); setOpen(false); }}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-left transition-all ${current === bg ? 'bg-[#FF6B9D]/20 text-[#FF6B9D]' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}>
              {BG_LABELS[bg].emoji} {BG_LABELS[bg].label}
            </button>
          ))}
        </div>
      )}
    </>
  );
};

/* ── Renderer ── */
export const AnimatedBackground: React.FC = () => {
  const { animatedBg } = usePlayerStore() as any;
  const bg = (animatedBg as BgType) || 'none';
  if (bg === 'none')      return null;
  if (bg === 'aurora')    return <AuroraBg />;
  if (bg === 'rain')      return <RainBg />;
  if (bg === 'galaxy')    return <GalaxyBg />;
  if (bg === 'lofi')      return <LofiCityBg />;
  if (bg === 'fireflies') return <FirefliesBg />;
  return null;
};
