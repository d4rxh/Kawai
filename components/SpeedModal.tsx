import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Gauge } from 'lucide-react';
import { usePlayerStore } from '../store/playerStore';

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export const SpeedButton: React.FC = () => {
  const { playbackSpeed, setPlaybackSpeed } = usePlayerStore();
  const [open, setOpen] = React.useState(false);
  const isDefault = playbackSpeed === 1;

  return (
    <>
      <button onClick={() => setOpen(true)}
        className={`relative p-2 rounded-full text-xs font-black transition-all w-9 h-9 flex items-center justify-center border
          ${!isDefault ? 'text-[#FF6B9D] border-[#FF6B9D]/40 bg-[#FF6B9D]/10' : 'text-white/40 border-transparent hover:text-white'}`}
        title="Playback Speed"
      >
        {isDefault ? <Gauge size={18} /> : `${playbackSpeed}x`}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[500] flex items-end justify-center" onClick={() => setOpen(false)}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="relative w-full max-w-md rounded-t-3xl p-6 pb-10"
              style={{ background: 'linear-gradient(180deg,#1E0030,#0A000F)' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Gauge size={20} className="text-[#FF6B9D]" />
                  <h3 className="text-white font-bold text-lg">Playback Speed</h3>
                </div>
                <button onClick={() => setOpen(false)} className="p-2 rounded-full hover:bg-white/10">
                  <X size={20} className="text-white/70" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {SPEEDS.map(s => (
                  <motion.button key={s} whileTap={{ scale: 0.95 }}
                    onClick={() => { setPlaybackSpeed(s); setOpen(false); }}
                    className={`py-4 rounded-2xl font-bold text-lg border transition-all
                      ${playbackSpeed === s
                        ? 'text-white border-[#FF6B9D]/60 bg-[#FF6B9D]/20'
                        : 'text-white/60 border-[#FF6B9D]/15 bg-[#2A0038]/50 hover:border-[#FF6B9D]/40'}`}
                  >
                    {s}x
                    {s === 1 && <span className="block text-[10px] font-normal opacity-60 mt-0.5">Normal</span>}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
