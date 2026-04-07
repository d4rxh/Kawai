import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ListMusic, GripVertical, Play, Trash2 } from 'lucide-react';
import { usePlayerStore } from '../store/playerStore';
import { getImageUrl } from '../services/api';

export const QueueModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { queue, currentSong, playSong, setQueue } = usePlayerStore();
  const [dragging, setDragging] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  const handleDragStart = (i: number) => setDragging(i);
  const handleDragOver = (e: React.DragEvent, i: number) => { e.preventDefault(); setDragOver(i); };
  const handleDrop = (i: number) => {
    if (dragging === null || dragging === i) return;
    const newQueue = [...queue];
    const [moved] = newQueue.splice(dragging, 1);
    newQueue.splice(i, 0, moved);
    setQueue(newQueue);
    setDragging(null);
    setDragOver(null);
  };
  const removeFromQueue = (i: number) => {
    const newQueue = queue.filter((_, idx) => idx !== i);
    setQueue(newQueue);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[500] flex items-end justify-center" onClick={onClose}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            className="relative w-full max-w-md rounded-t-3xl flex flex-col"
            style={{ background: 'linear-gradient(180deg,#1E0030,#0A000F)', maxHeight: '80vh' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <ListMusic size={20} className="text-[#FF6B9D]" />
                <h3 className="text-white font-bold text-lg">Queue ({queue.length})</h3>
              </div>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10">
                <X size={20} className="text-white/70" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 px-3 pb-6 no-scrollbar">
              {queue.length === 0 && (
                <p className="text-center text-[#D4A0BA]/50 py-12 text-sm">Queue empty hai 🌸</p>
              )}
              {queue.map((song, i) => {
                const isPlaying = currentSong?.id === song.id;
                return (
                  <div key={song.id + i}
                    draggable
                    onDragStart={() => handleDragStart(i)}
                    onDragOver={e => handleDragOver(e, i)}
                    onDrop={() => handleDrop(i)}
                    className={`flex items-center gap-3 p-2.5 rounded-xl mb-1 transition-all cursor-grab active:cursor-grabbing
                      ${isPlaying ? 'bg-[#FF6B9D]/15 border border-[#FF6B9D]/30' : 'hover:bg-white/5'}
                      ${dragOver === i ? 'border-t-2 border-[#FF6B9D]' : ''}`}
                  >
                    <GripVertical size={16} className="text-white/20 shrink-0" />
                    <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-[#2A0038]">
                      <img src={getImageUrl(song.image)} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0" onClick={() => playSong(song, queue)}>
                      <p className={`text-sm font-medium truncate ${isPlaying ? 'text-[#FF6B9D]' : 'text-white'}`}>{song.name}</p>
                      <p className="text-xs text-[#D4A0BA]/60 truncate">{song.artists?.primary?.[0]?.name}</p>
                    </div>
                    {isPlaying && <Play size={14} className="text-[#FF6B9D] shrink-0" fill="#FF6B9D" />}
                    <button onClick={() => removeFromQueue(i)} className="p-1.5 rounded-full hover:bg-red-500/20 text-white/30 hover:text-red-400 transition-colors shrink-0">
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
