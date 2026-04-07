import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Car, X, SkipBack, SkipForward, Play, Pause, Heart, Shuffle } from 'lucide-react';
import { usePlayerStore } from '../store/playerStore';
import { getImageUrl } from '../services/api';

export const CarModeButton: React.FC = () => {
  const { carMode, setCarMode } = usePlayerStore() as any;
  const { currentSong, isPlaying, togglePlay, nextSong, prevSong, toggleLike, likedSongs, shuffleMode, toggleShuffle } = usePlayerStore();

  if (!currentSong) return null;

  const isLiked = likedSongs.some(s => s.id === currentSong.id);

  return (
    <>
      <button onClick={() => (setCarMode as any)(!carMode)}
        className={`p-2 rounded-full transition-all ${carMode ? 'text-[#FF6B9D] bg-[#FF6B9D]/15' : 'text-white/40 hover:text-white'}`}
        title="Car Mode">
        <Car size={20} />
      </button>

      <AnimatePresence>
        {carMode && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[700] flex flex-col"
            style={{ background: 'linear-gradient(180deg,#050010,#0A000F)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-12 pb-4">
              <div className="flex items-center gap-2">
                <Car size={24} className="text-[#FF6B9D]" />
                <span className="text-white font-bold text-lg">Car Mode</span>
              </div>
              <button onClick={() => (setCarMode as any)(false)}
                className="p-3 rounded-full bg-[#2A0038] text-white">
                <X size={24} />
              </button>
            </div>

            {/* Large Album Art */}
            <div className="flex-1 flex flex-col items-center justify-center px-8 gap-8">
              <motion.div
                animate={{ rotate: isPlaying ? 360 : 0 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="w-56 h-56 rounded-full overflow-hidden border-4 border-[#FF6B9D]/30 shadow-2xl shadow-[#FF6B9D]/20"
              >
                <img src={getImageUrl(currentSong.image)} alt="" className="w-full h-full object-cover" />
              </motion.div>

              <div className="text-center">
                <p className="text-white font-black text-2xl leading-tight">{currentSong.name}</p>
                <p className="text-[#D4A0BA] text-lg mt-1">{currentSong.artists?.primary?.[0]?.name}</p>
              </div>

              {/* Big Controls */}
              <div className="flex items-center gap-8">
                <button onClick={prevSong} className="w-16 h-16 rounded-full bg-[#2A0038] flex items-center justify-center active:scale-95 transition-transform">
                  <SkipBack size={32} className="text-white" fill="white" />
                </button>
                <button onClick={togglePlay}
                  className="w-24 h-24 rounded-full flex items-center justify-center active:scale-95 transition-transform shadow-lg shadow-[#FF6B9D]/30"
                  style={{ background: 'linear-gradient(135deg,#FF6B9D,#C2185B)' }}>
                  {isPlaying ? <Pause size={40} fill="white" className="text-white" /> : <Play size={40} fill="white" className="text-white ml-2" />}
                </button>
                <button onClick={nextSong} className="w-16 h-16 rounded-full bg-[#2A0038] flex items-center justify-center active:scale-95 transition-transform">
                  <SkipForward size={32} className="text-white" fill="white" />
                </button>
              </div>

              {/* Secondary controls */}
              <div className="flex gap-8">
                <button onClick={() => toggleLike(currentSong)}
                  className={`w-14 h-14 rounded-full flex items-center justify-center ${isLiked ? 'bg-[#FF6B9D]/20' : 'bg-[#2A0038]'}`}>
                  <Heart size={24} fill={isLiked ? '#FF6B9D' : 'none'} className={isLiked ? 'text-[#FF6B9D]' : 'text-white'} />
                </button>
                <button onClick={toggleShuffle}
                  className={`w-14 h-14 rounded-full flex items-center justify-center ${shuffleMode !== 'off' ? 'bg-[#FF6B9D]/20' : 'bg-[#2A0038]'}`}>
                  <Shuffle size={24} className={shuffleMode !== 'off' ? 'text-[#FF6B9D]' : 'text-white'} />
                </button>
              </div>
            </div>

            {/* Bottom safe area */}
            <div className="h-16" />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
