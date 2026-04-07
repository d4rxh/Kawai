import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { usePlayerStore } from '../store/playerStore';
import { getImageUrl } from '../services/api';

export const MusicMemory: React.FC = () => {
  const { history, playSong } = usePlayerStore();
  const [memory, setMemory] = useState<any>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (history.length < 5) return;
    // Show a "memory" after 5s — pick a random song from history
    const t = setTimeout(() => {
      const idx = Math.floor(Math.random() * Math.min(history.length, 20));
      const song = history[idx];
      if (song) { setMemory(song); setShow(true); }
    }, 6000);
    return () => clearTimeout(t);
  }, []);

  if (!memory) return null;

  const daysAgo = Math.floor(Math.random() * 365) + 1;
  const timeLabel = daysAgo === 1 ? 'Kal' : daysAgo < 7 ? `${daysAgo} din pehle` : daysAgo < 30 ? `${Math.floor(daysAgo/7)} hafte pehle` : `${Math.floor(daysAgo/30)} mahine pehle`;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', damping: 22, stiffness: 250 }}
          className="fixed bottom-[150px] left-4 right-4 z-[400] max-w-sm mx-auto"
        >
          <div className="rounded-2xl p-4 border border-[#A855F7]/30 flex items-center gap-3"
            style={{ background: 'linear-gradient(135deg,rgba(168,85,247,0.15),rgba(10,0,15,0.95))' }}>
            <img src={getImageUrl(memory.image)} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0 border border-white/10"/>
            <div className="flex-1 min-w-0">
              <p className="text-[#A855F7] text-[10px] font-bold tracking-widest">🕐 {timeLabel} suna tha</p>
              <p className="text-white font-bold text-sm truncate">{memory.name}</p>
              <p className="text-[#D4A0BA] text-xs truncate">{memory.artists?.primary?.[0]?.name}</p>
            </div>
            <div className="flex flex-col gap-1 shrink-0">
              <motion.button whileTap={{ scale: 0.95 }}
                onClick={() => { playSong(memory, [memory]); setShow(false); }}
                className="px-3 py-1.5 rounded-full text-white text-xs font-bold"
                style={{ background: 'linear-gradient(135deg,#A855F7,#7C3AED)' }}>
                ▶ Play
              </motion.button>
              <button onClick={() => setShow(false)} className="text-center text-white/30 text-xs hover:text-white/60">
                dismiss
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
