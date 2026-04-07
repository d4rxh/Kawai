import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mic2, Music2 } from 'lucide-react';
import { usePlayerStore } from '../store/playerStore';

// Simulated lyrics with timestamps (in seconds)
// In production this would come from a lyrics API
function generateSampleLyrics(song: any): { time: number; text: string }[] {
  const duration = parseInt(song?.duration) || 200;
  const artistName = song?.artists?.primary?.[0]?.name || 'Artist';
  const songName = song?.name || 'Song';
  const lines = [
    `🌸 ${songName}`, `— ${artistName} —`, '',
    'Yeh pal hain anmol, na jaane kab beet jayein',
    'Dil ki dharkan mein teri awaaz hai,',
    'Tere bina sab kuch adhura sa lagta hai,',
    'Aaja mere paas, tujhe chain milega,',
    '', 'Tere naam ki tasbih japton hoon,',
    'Raat din teri yaad mein kho jaata hoon,',
    'Aankhon mein tu, sapnon mein tu,',
    'Dil ki dhadkan mein sirf teri dhun,',
    '', '🌸 Kawai Sakura 🌸',
    'Teri hansi mein duniya basai hai,',
    'Tere pyaar mein khud ko paya hai,',
    'Ab tere bina jeena nahi,',
    'Tujhse hi meri zindagi...',
  ];
  const step = duration / lines.length;
  return lines.map((text, i) => ({ time: i * step, text }));
}

export const LyricsButton: React.FC = () => {
  const { currentSong, audioElement, isPlaying } = usePlayerStore();
  const [open, setOpen] = useState(false);
  const [currentLine, setCurrentLine] = useState(0);
  const [lyrics, setLyrics] = useState<{ time: number; text: string }[]>([]);

  useEffect(() => {
    if (currentSong) {
      setLyrics(generateSampleLyrics(currentSong));
      setCurrentLine(0);
    }
  }, [currentSong?.id]);

  useEffect(() => {
    if (!open || !audioElement) return;
    const iv = setInterval(() => {
      const t = audioElement.currentTime;
      const arr = [...lyrics].reverse();
      const reverseIdx = arr.findIndex((l: any) => l.time <= t);
      const idx = reverseIdx >= 0 ? lyrics.length - 1 - reverseIdx : -1;
      if (idx >= 0) setCurrentLine(idx);
    }, 500);
    return () => clearInterval(iv);
  }, [open, audioElement, lyrics]);

  if (!currentSong) return null;

  return (
    <>
      <motion.button whileTap={{ scale: 0.95 }} onClick={() => setOpen(true)}
        className="p-2 rounded-full text-white/40 hover:text-[#FF6B9D] transition-all" title="Lyrics">
        <Mic2 size={20} />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: '100%' }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed inset-0 z-[600] flex flex-col overflow-hidden"
            style={{ background: 'linear-gradient(180deg,#0A000F 0%,#1E0030 50%,#0A000F 100%)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-12 pb-4 shrink-0">
              <div className="flex items-center gap-2">
                <Mic2 size={20} className="text-[#FF6B9D]" />
                <span className="text-white font-bold">Lyrics</span>
              </div>
              <button onClick={() => setOpen(false)} className="p-2 rounded-full bg-[#2A0038] hover:bg-[#3D0050]">
                <X size={20} className="text-white" />
              </button>
            </div>

            {/* Song info */}
            <div className="flex items-center gap-3 px-5 pb-4 shrink-0">
              <div className="w-12 h-12 rounded-xl overflow-hidden border border-[#FF6B9D]/20">
                <img src={currentSong.image?.[1]?.url || currentSong.image?.[0]?.url} alt="" className="w-full h-full object-cover"/>
              </div>
              <div>
                <p className="text-white font-bold text-sm">{currentSong.name}</p>
                <p className="text-[#D4A0BA] text-xs">{currentSong.artists?.primary?.[0]?.name}</p>
              </div>
              {isPlaying && <div className="ml-auto flex gap-1 items-end h-5">
                {[0,1,2,3].map(i => (
                  <div key={i} className="w-1 rounded-full bg-[#FF6B9D]"
                    style={{ height: `${40+i*15}%`, animation: `bounce 0.8s ease-in-out ${i*0.15}s infinite alternate` }}/>
                ))}
              </div>}
            </div>

            {/* Lyrics scroll */}
            <div className="flex-1 overflow-y-auto no-scrollbar px-6 py-4">
              {lyrics.map((line, i) => {
                const isCurrent = i === currentLine;
                const isPast = i < currentLine;
                return (
                  <motion.p key={i}
                    animate={{ opacity: isCurrent ? 1 : isPast ? 0.3 : 0.5, scale: isCurrent ? 1.02 : 1 }}
                    transition={{ duration: 0.3 }}
                    className={`mb-4 leading-relaxed transition-all ${
                      line.text === '' ? 'h-3' :
                      isCurrent ? 'text-white font-black text-2xl' :
                      isPast    ? 'text-[#D4A0BA]/40 text-xl font-medium' :
                                  'text-[#D4A0BA]/60 text-xl font-medium'
                    }`}
                  >
                    {line.text || '\u00A0'}
                  </motion.p>
                );
              })}
              <div className="h-32"/>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
