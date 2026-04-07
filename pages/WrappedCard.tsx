import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Download, Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePlayerStore } from '../store/playerStore';
import { getImageUrl } from '../services/api';

export const WrappedCard: React.FC = () => {
  const navigate = useNavigate();
  const { history, playCounts, artistPlayCounts, totalListeningSeconds, weeklyListeningSeconds, listeningStreak, badges, currentUser, appTheme } = usePlayerStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [generated, setGenerated] = useState(false);
  const [cardUrl, setCardUrl] = useState<string | null>(null);

  const topSongs = [...history].sort((a,b) => (playCounts[b.id]||0)-(playCounts[a.id]||0)).slice(0,5);
  const topArtistEntry = Object.entries(artistPlayCounts).sort(([,a],[,b])=>b-a)[0];
  const topArtist = topArtistEntry ? history.find(s=>s.artists?.primary?.some(a=>a.id===topArtistEntry[0]))?.artists?.primary?.[0]?.name : null;
  const totalHours = Math.round(totalListeningSeconds / 3600);
  const month = new Date().toLocaleString('default',{month:'long'});
  const year = new Date().getFullYear();

  const THEME_COLORS: Record<string,string[]> = {
    sakura:    ['#FF6B9D','#C2185B'],
    moonlight: ['#A855F7','#6D28D9'],
    ocean:     ['#06B6D4','#0284C7'],
    cherry:    ['#EF4444','#B91C1C'],
    midnight:  ['#6366F1','#4338CA'],
  };
  const [c1,c2] = THEME_COLORS[appTheme] || THEME_COLORS.sakura;

  const generateCard = async () => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    canvas.width = 540; canvas.height = 960;

    // Background
    const bg = ctx.createLinearGradient(0,0,540,960);
    bg.addColorStop(0,'#0A000F'); bg.addColorStop(0.5,`${c1}22`); bg.addColorStop(1,'#0A000F');
    ctx.fillStyle = bg; ctx.fillRect(0,0,540,960);

    // Glow
    const glow = ctx.createRadialGradient(270,200,0,270,200,300);
    glow.addColorStop(0,`${c1}30`); glow.addColorStop(1,'transparent');
    ctx.fillStyle=glow; ctx.fillRect(0,0,540,960);

    // Header
    ctx.fillStyle=c1; ctx.font='bold 16px sans-serif';
    ctx.textAlign='center'; ctx.fillText('🌸 KAWAI SAKURA', 270, 50);
    ctx.fillStyle='white'; ctx.font='bold 36px sans-serif';
    ctx.fillText(`${month} ${year}`, 270, 95);
    ctx.fillStyle=c1; ctx.font='14px sans-serif';
    ctx.fillText('さくら音楽 • Wrapped', 270, 120);

    // Divider
    ctx.strokeStyle=`${c1}50`; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(40,140); ctx.lineTo(500,140); ctx.stroke();

    // Stats
    const stats = [
      { label: 'Ghante Sune', value: `${totalHours}h`, emoji: '⏱️' },
      { label: 'Songs Played', value: `${history.length}`, emoji: '🎵' },
      { label: 'Listening Streak', value: `${listeningStreak} days`, emoji: '🔥' },
      { label: 'Badges Earned', value: `${badges.length}`, emoji: '🏅' },
    ];
    stats.forEach(({ label, value, emoji }, i) => {
      const x = i % 2 === 0 ? 100 : 400, y = 200 + Math.floor(i/2) * 110;
      ctx.fillStyle=`${c1}20`; ctx.beginPath(); ctx.roundRect(x-80,y-35,160,90,16); ctx.fill();
      ctx.strokeStyle=`${c1}40`; ctx.lineWidth=1; ctx.stroke();
      ctx.font='28px sans-serif'; ctx.fillStyle='white'; ctx.textAlign='center';
      ctx.fillText(emoji, x, y-5);
      ctx.font='bold 22px sans-serif'; ctx.fillStyle=c1;
      ctx.fillText(value, x, y+22);
      ctx.font='11px sans-serif'; ctx.fillStyle='rgba(255,255,255,0.5)';
      ctx.fillText(label, x, y+40);
    });

    // Top Artist
    if (topArtist) {
      ctx.fillStyle='rgba(255,255,255,0.05)'; ctx.beginPath(); ctx.roundRect(40,430,460,80,16); ctx.fill();
      ctx.fillStyle='white'; ctx.font='bold 14px sans-serif'; ctx.textAlign='left';
      ctx.fillText('🎤 Top Artist', 65, 460);
      ctx.fillStyle=c1; ctx.font='bold 22px sans-serif';
      ctx.fillText(topArtist, 65, 492);
      ctx.fillStyle='rgba(255,255,255,0.3)'; ctx.font='12px sans-serif';
      ctx.fillText(`${topArtistEntry?.[1] || 0} plays`, 65, 510);
    }

    // Top Songs
    ctx.fillStyle='white'; ctx.font='bold 16px sans-serif'; ctx.textAlign='left';
    ctx.fillText('🎵 Top 5 Songs', 40, 555);
    topSongs.slice(0,5).forEach((s,i) => {
      const y = 580+i*52;
      ctx.fillStyle=`rgba(255,255,255,${0.04-i*0.005})`; ctx.beginPath(); ctx.roundRect(40,y-18,460,46,12); ctx.fill();
      // Try to load album art
      ctx.fillStyle=c1; ctx.font=`bold ${16-i}px sans-serif`; ctx.textAlign='left';
      ctx.fillText(`${i+1}. ${s.name.slice(0,32)}`, 70, y+8);
      ctx.fillStyle='rgba(255,255,255,0.35)'; ctx.font='11px sans-serif';
      ctx.fillText(s.artists?.primary?.[0]?.name||'', 70, y+22);
      ctx.fillStyle=c1; ctx.font='bold 12px sans-serif'; ctx.textAlign='right';
      ctx.fillText(`${playCounts[s.id]||1}x`, 490, y+8);
    });

    // Footer
    ctx.fillStyle='rgba(255,255,255,0.2)'; ctx.font='12px sans-serif'; ctx.textAlign='center';
    ctx.fillText('kawai-sakura.app • さくら音楽 🌸', 270, 940);

    setCardUrl(canvas.toDataURL('image/png'));
    setGenerated(true);
  };

  const handleDownload = () => {
    if (!cardUrl) return;
    const a = document.createElement('a');
    a.href = cardUrl;
    a.download = `kawai-sakura-wrapped-${month}-${year}.png`;
    a.click();
  };

  return (
    <div className="min-h-full flex flex-col pb-32" style={{ background: '#0A000F' }}>
      <div className="sticky top-0 z-20 flex items-center gap-3 px-4 py-4"
        style={{ background: 'linear-gradient(to bottom,#0A000F,transparent)' }}>
        <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-[#2A0038] text-white">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-white font-black text-xl">🎵 Monthly Wrapped</h1>
          <p className="text-[#D4A0BA] text-xs">Tumhari music journey ka summary</p>
        </div>
      </div>

      <div className="px-4 space-y-4">
        {/* Stats preview */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { emoji: '⏱️', val: `${totalHours}h`, label: 'Total Sune' },
            { emoji: '🎵', val: history.length, label: 'Songs Played' },
            { emoji: '🔥', val: `${listeningStreak}d`, label: 'Streak' },
            { emoji: '🏅', val: badges.length, label: 'Badges' },
          ].map((s,i) => (
            <motion.div key={i} initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }} transition={{ delay:i*0.08 }}
              className="rounded-2xl p-4 border border-[#FF6B9D]/15 bg-[#130018] flex items-center gap-3">
              <span className="text-3xl">{s.emoji}</span>
              <div>
                <p className="text-white font-black text-2xl leading-none">{s.val}</p>
                <p className="text-[#D4A0BA] text-xs">{s.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {topArtist && (
          <div className="rounded-2xl p-4 border border-[#FF6B9D]/20 bg-[#130018]">
            <p className="text-[#D4A0BA] text-xs mb-1">🎤 Top Artist</p>
            <p className="text-white font-black text-xl">{topArtist}</p>
            <p className="text-[#FF6B9D] text-sm">{topArtistEntry?.[1]} plays</p>
          </div>
        )}

        {topSongs.length > 0 && (
          <div className="rounded-2xl p-4 border border-[#FF6B9D]/10 bg-[#130018]">
            <p className="text-[#D4A0BA] text-xs mb-3">🎵 Top Songs</p>
            {topSongs.map((s,i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-[#FF6B9D]/8 last:border-0">
                <span className="text-[#FF6B9D] font-black w-5 text-sm">{i+1}</span>
                <img src={getImageUrl(s.image)} alt="" className="w-8 h-8 rounded-lg object-cover"/>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-bold truncate">{s.name}</p>
                  <p className="text-[#D4A0BA] text-xs truncate">{s.artists?.primary?.[0]?.name}</p>
                </div>
                <span className="text-[#FF6B9D] text-xs font-bold">{playCounts[s.id]||1}x</span>
              </div>
            ))}
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />

        <motion.button whileTap={{ scale: 0.97 }}
          onClick={generated ? handleDownload : generateCard}
          className="w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2 text-base"
          style={{ background: `linear-gradient(135deg,${c1},${c2})` }}>
          {generated ? <><Download size={18}/> Card Download Karo</> : <><Share2 size={18}/> Wrapped Card Generate Karo</>}
        </motion.button>

        {cardUrl && (
          <motion.div initial={{ opacity:0,scale:0.95 }} animate={{ opacity:1,scale:1 }} className="rounded-2xl overflow-hidden border border-[#FF6B9D]/20">
            <img src={cardUrl} alt="Wrapped Card" className="w-full"/>
          </motion.div>
        )}
      </div>
    </div>
  );
};
