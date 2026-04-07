import React, { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Radio } from 'lucide-react';
import { usePlayerStore } from '../store/playerStore';
import { api } from '../services/api';

// AutoDJ: when queue has < 3 songs left, auto-fetch similar songs
export const AutoDJ: React.FC = () => {
  const { autoDJEnabled, queue, currentSong, setAutoDJ, addToQueue } = usePlayerStore();
  const fetchingRef = useRef(false);

  useEffect(() => {
    if (!autoDJEnabled || !currentSong || fetchingRef.current) return;
    const songsLeft = queue.findIndex(s => s.id === currentSong.id);
    const remaining = queue.length - songsLeft - 1;
    if (remaining > 3) return;

    fetchingRef.current = true;
    const artistName = currentSong.artists?.primary?.[0]?.name || '';
    const queries = [
      `${artistName} similar songs`,
      currentSong.genre || 'popular hits',
    ];
    const q = queries[Math.floor(Math.random() * queries.length)];

    api.searchSongs(q).then(songs => {
      const existingIds = new Set(queue.map(s => s.id));
      const newSongs = songs.filter(s => !existingIds.has(s.id) && s.id !== currentSong.id).slice(0, 5);
      newSongs.forEach(s => addToQueue(s));
    }).catch(() => {}).finally(() => { fetchingRef.current = false; });
  }, [currentSong?.id, queue.length, autoDJEnabled]);

  return (
    <motion.button whileTap={{ scale: 0.95 }}
      onClick={() => setAutoDJ(!autoDJEnabled)}
      className={`flex items-center gap-2 p-2 rounded-full transition-all ${
        autoDJEnabled ? 'text-[#FF6B9D] bg-[#FF6B9D]/15' : 'text-white/40 hover:text-white'
      }`} title="Auto DJ">
      <Radio size={18} />
      {autoDJEnabled && (
        <span className="text-[10px] font-bold pr-1">DJ ON</span>
      )}
    </motion.button>
  );
};
