import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Wand2, Loader2 } from 'lucide-react';
import { usePlayerStore } from '../store/playerStore';
import { api } from '../services/api';
import { SongCard } from './SongCard';

const VIBE_MAP: Record<string, { query: string; emoji: string; color: string }> = {
  sad: { query: 'sad emotional heartbreak songs', emoji: '😢', color: '#6366F1' },
  udaas: { query: 'sad emotional hindi songs', emoji: '😢', color: '#6366F1' },
  happy: { query: 'happy upbeat feel good songs', emoji: '😊', color: '#F59E0B' },
  khush: { query: 'happy bollywood party songs', emoji: '😄', color: '#F59E0B' },
  angry: { query: 'angry intense rock metal', emoji: '😤', color: '#EF4444' },
  gussa: { query: 'angry intense hindi songs', emoji: '😤', color: '#EF4444' },
  romantic: { query: 'romantic love songs hindi', emoji: '❤️', color: '#FF6B9D' },
  pyaar: { query: 'romantic hindi love songs', emoji: '💕', color: '#FF6B9D' },
  chill: { query: 'chill lo-fi relax beats', emoji: '😌', color: '#06B6D4' },
  relax: { query: 'relaxing peaceful ambient', emoji: '🧘', color: '#10B981' },
  party: { query: 'party dance edm hits 2024', emoji: '🎉', color: '#A855F7' },
  workout: { query: 'workout gym energy motivation', emoji: '💪', color: '#EF4444' },
  akela: { query: 'alone introspective songs', emoji: '🌙', color: '#4B5563' },
  alone: { query: 'alone introspective indie', emoji: '🌙', color: '#4B5563' },
  excited: { query: 'excited hype energetic songs', emoji: '🔥', color: '#F97316' },
  bored: { query: 'discovery new interesting songs', emoji: '🤔', color: '#8B5CF6' },
  drive: { query: 'road trip driving songs', emoji: '🚗', color: '#0EA5E9' },
  study: { query: 'study focus concentration music', emoji: '📚', color: '#10B981' },
  padhai: { query: 'study focus hindi background', emoji: '📚', color: '#10B981' },
  neend: { query: 'sleep peaceful lullaby calm', emoji: '😴', color: '#1E3A5F' },
  sleep: { query: 'sleep calm relaxing gentle', emoji: '😴', color: '#1E3A5F' },
};

function detectVibe(text: string): { query: string; emoji: string; color: string; matched: string } {
  const lower = text.toLowerCase();
  for (const [key, val] of Object.entries(VIBE_MAP)) {
    if (lower.includes(key)) return { ...val, matched: key };
  }
  // Fallback: use text as search query directly
  return { query: text, emoji: '🎵', color: '#FF6B9D', matched: 'custom' };
}

export const VibeCheck: React.FC = () => {
  const { playSong } = usePlayerStore();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ songs: any[]; vibe: typeof VIBE_MAP[string] & { matched: string } } | null>(null);

  const handleVibe = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const vibe = detectVibe(input);
      const songs = await api.searchSongs(vibe.query);
      setResult({ songs: songs.slice(0, 8), vibe });
    } catch {}
    finally { setLoading(false); }
  };

  const QUICK_VIBES = ['😢 Sad','😊 Khush','❤️ Romantic','💪 Workout','😌 Chill','🎉 Party','📚 Study','🚗 Drive'];

  return (
    <>
      <motion.button whileTap={{ scale: 0.95 }} onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-[#A855F7]/30 bg-[#A855F7]/10 hover:bg-[#A855F7]/20 transition-all">
        <Wand2 size={16} className="text-[#A855F7]" />
        <div className="flex flex-col items-start">
          <span className="text-white font-bold text-xs">Vibe Check</span>
          <span className="text-[#A855F7] text-[10px]">mood se playlist</span>
        </div>
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
              style={{ background: 'linear-gradient(180deg,#140020,#0A000F)', maxHeight: '90vh' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-5 pb-3 shrink-0">
                <div className="flex items-center gap-2">
                  <Wand2 size={18} className="text-[#A855F7]" />
                  <span className="text-white font-bold">Vibe Check 🎭</span>
                </div>
                <button onClick={() => setOpen(false)} className="p-2 rounded-full hover:bg-white/10">
                  <X size={18} className="text-white/50" />
                </button>
              </div>

              <div className="overflow-y-auto no-scrollbar flex-1 px-5 pb-8">
                <p className="text-[#D4A0BA] text-sm mb-4">Apna mood likho ya quick vibe choose karo — playlist ban jaayegi! ✨</p>

                {/* Input */}
                <div className="flex gap-2 mb-4">
                  <input
                    value={input} onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleVibe()}
                    placeholder="e.g. 'main bahut sad hoon' ya 'drive pe jaana hai'"
                    className="flex-1 bg-[#1E0028] border border-[#A855F7]/30 rounded-xl px-4 py-3 text-white text-sm placeholder-[#D4A0BA]/40 focus:outline-none focus:border-[#A855F7]"
                  />
                  <motion.button whileTap={{ scale: 0.95 }} onClick={handleVibe} disabled={loading}
                    className="px-4 py-3 rounded-xl font-bold text-white text-sm flex items-center gap-2 disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg,#A855F7,#7C3AED)' }}>
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
                  </motion.button>
                </div>

                {/* Quick vibes */}
                <div className="flex flex-wrap gap-2 mb-5">
                  {QUICK_VIBES.map(v => {
                    const key = v.split(' ')[1].toLowerCase();
                    return (
                      <motion.button key={v} whileTap={{ scale: 0.95 }}
                        onClick={() => { setInput(key); setTimeout(handleVibe, 50); }}
                        className="px-3 py-1.5 rounded-full bg-[#2A0038] border border-[#FF6B9D]/15 text-white/70 text-xs hover:border-[#FF6B9D]/40 hover:text-white transition-all">
                        {v}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Results */}
                {result && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="flex items-center gap-2 mb-4 p-3 rounded-xl border"
                      style={{ background: `${result.vibe.color}18`, borderColor: `${result.vibe.color}40` }}>
                      <span className="text-2xl">{result.vibe.emoji}</span>
                      <div>
                        <p className="text-white font-bold text-sm capitalize">"{result.vibe.matched}" vibe detected!</p>
                        <p className="text-white/50 text-xs">{result.songs.length} songs found</p>
                      </div>
                      <motion.button whileTap={{ scale: 0.95 }} className="ml-auto px-3 py-1.5 rounded-full text-white text-xs font-bold"
                        style={{ background: result.vibe.color }}
                        onClick={() => result.songs.length > 0 && playSong(result.songs[0], result.songs)}>
                        ▶ Play All
                      </motion.button>
                    </div>
                    <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                      {result.songs.map((song, i) => (
                        <SongCard key={i} item={song} onPlay={() => playSong(song, result.songs)} />
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
