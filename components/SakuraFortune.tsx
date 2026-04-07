import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles } from 'lucide-react';
import { usePlayerStore } from '../store/playerStore';
import { api } from '../services/api';
import { SongCard } from './SongCard';

export const SakuraFortune: React.FC = () => {
  const { todayFortune, lastFortuneDate, generateFortune, playSong } = usePlayerStore();
  const [open, setOpen] = useState(false);
  const [songs, setSongs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const today = new Date().toDateString();
  const hasNewFortune = lastFortuneDate !== today;

  useEffect(() => {
    if (open && todayFortune && songs.length === 0) {
      setLoading(true);
      api.searchSongs(todayFortune.songQuery)
        .then(r => setSongs(r.slice(0, 6)))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [open, todayFortune]);

  const handleOpen = () => {
    if (hasNewFortune || !todayFortune) generateFortune();
    setOpen(true);
  };

  return (
    <>
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={handleOpen}
        className="relative flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-[#FF6B9D]/30 bg-[#FF6B9D]/10 hover:bg-[#FF6B9D]/20 transition-all"
      >
        <span className="text-xl">🌸</span>
        <div className="flex flex-col items-start">
          <span className="text-white font-bold text-xs leading-tight">Aaj ka Fortune</span>
          <span className="text-[#FF6B9D] text-[10px]">さくらおみくじ</span>
        </div>
        {hasNewFortune && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#FF6B9D] rounded-full animate-pulse" />
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[500] flex items-end justify-center" onClick={() => setOpen(false)}>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="relative w-full max-w-md rounded-t-3xl flex flex-col"
              style={{ background: 'linear-gradient(180deg,#1E0030 0%,#0A000F 100%)', maxHeight: '88vh' }}
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 pb-2 shrink-0">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-[#FF6B9D]" />
                  <span className="text-white font-bold">Aaj ka Sakura Fortune</span>
                  <span className="text-xs text-[#D4A0BA]">🗓️ {new Date().toLocaleDateString('hi-IN')}</span>
                </div>
                <button onClick={() => setOpen(false)} className="p-2 rounded-full hover:bg-white/10">
                  <X size={18} className="text-white/50" />
                </button>
              </div>

              <div className="overflow-y-auto no-scrollbar flex-1 px-5 pb-8">
                {/* Fortune Card */}
                {todayFortune && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.15, type: 'spring' }}
                    className="rounded-3xl p-6 mb-5 text-center border border-[#FF6B9D]/20 relative overflow-hidden"
                    style={{ background: 'linear-gradient(135deg,rgba(255,107,157,0.15),rgba(194,24,91,0.08))' }}
                  >
                    {/* Decorative petals */}
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="absolute text-[#FF6B9D]/10 text-6xl select-none pointer-events-none"
                        style={{ top: `${10+i*14}%`, left: `${i%2===0?5:75}%`, transform: `rotate(${i*60}deg)` }}>🌸</div>
                    ))}
                    <p className="text-[#FF6B9D] text-xs font-bold tracking-widest mb-3 relative z-10">今日の言葉</p>
                    <p className="text-white font-bold text-lg leading-snug mb-2 relative z-10">
                      "{todayFortune.quote}"
                    </p>
                    <p className="text-[#D4A0BA] text-sm italic relative z-10">{todayFortune.jp}</p>
                    <div className="mt-4 h-px bg-gradient-to-r from-transparent via-[#FF6B9D]/40 to-transparent" />
                    <p className="text-[#FF6B9D]/70 text-xs mt-3 relative z-10">🎵 Aaj ke liye recommended vibe:</p>
                    <p className="text-white/60 text-xs relative z-10 capitalize">{todayFortune.songQuery}</p>
                  </motion.div>
                )}

                {/* Recommended Songs */}
                <p className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                  <span>🎶</span> Fortune ke liye Songs
                </p>
                {loading ? (
                  <div className="flex justify-center py-6">
                    <div className="flex gap-2">
                      {[0,1,2].map(i => (
                        <div key={i} className="w-2 h-2 rounded-full bg-[#FF6B9D] animate-bounce"
                          style={{ animationDelay: `${i*0.15}s` }} />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                    {songs.map((song, i) => (
                      <SongCard key={i} item={song} onPlay={() => playSong(song, songs)} />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
