import React, { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Clock, Play, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePlayerStore } from '../store/playerStore';
import { api } from '../services/api';
import { SongCard } from '../components/SongCard';

const DECADES = [
  { year: 1970, label: '70s', emoji: '🕺', genre: 'disco funk classic 70s' },
  { year: 1980, label: '80s', emoji: '🎸', genre: 'rock pop 80s classic hits' },
  { year: 1990, label: '90s', emoji: '📼', genre: 'bollywood 90s hindi hits' },
  { year: 2000, label: '2000s', emoji: '📀', genre: 'pop r&b 2000s hits' },
  { year: 2010, label: '2010s', emoji: '📱', genre: 'pop edm 2010s trending' },
  { year: 2020, label: '2020s', emoji: '🎧', genre: 'pop hip hop 2020s trending' },
];

const YEARS = Array.from({ length: 30 }, (_, i) => 2024 - i);

export const TimeMachine: React.FC = () => {
  const navigate = useNavigate();
  const { playSong, timeMachineYear, setTimeMachineYear } = usePlayerStore();
  const [songs, setSongs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const fetchSongs = useCallback(async (year: number) => {
    setLoading(true);
    setSearched(true);
    try {
      const langs = ['hindi', 'english', 'punjabi'];
      const results = await Promise.all(langs.map(l => api.searchSongs(`${l} hits ${year} popular`)));
      const combined = results.flat().slice(0, 16);
      setSongs(combined);
    } catch {}
    finally { setLoading(false); }
  }, []);

  const handleYear = (year: number) => {
    setTimeMachineYear(year);
    fetchSongs(year);
  };

  return (
    <div className="min-h-full flex flex-col pb-36" style={{ background: '#0A000F' }}>
      {/* Header */}
      <div className="sticky top-0 z-20 flex items-center gap-3 px-4 py-4"
        style={{ background: 'linear-gradient(to bottom,#0A000F,transparent)' }}>
        <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-[#2A0038] text-white hover:bg-[#3D0050]">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-white font-black text-xl flex items-center gap-2">
            <Clock size={20} className="text-[#FF6B9D]" /> Music Time Machine
          </h1>
          <p className="text-[#D4A0BA] text-xs">Kisi bhi saal ke hits suno ⏰</p>
        </div>
      </div>

      <div className="px-4">
        {/* Decade quick picks */}
        <p className="text-[#D4A0BA] text-xs font-bold tracking-widest mb-3 uppercase">Quick Decades</p>
        <div className="grid grid-cols-3 gap-3 mb-6">
          {DECADES.map(d => (
            <motion.button key={d.year} whileTap={{ scale: 0.95 }}
              onClick={() => handleYear(d.year)}
              className={`p-3 rounded-2xl border flex flex-col items-center gap-1 transition-all ${
                timeMachineYear === d.year
                  ? 'border-[#FF6B9D]/60 bg-[#FF6B9D]/15 text-[#FF6B9D]'
                  : 'border-[#FF6B9D]/15 bg-[#130018] text-white/70 hover:border-[#FF6B9D]/40'
              }`}>
              <span className="text-2xl">{d.emoji}</span>
              <span className="font-black text-base">{d.label}</span>
            </motion.button>
          ))}
        </div>

        {/* Year slider */}
        <p className="text-[#D4A0BA] text-xs font-bold tracking-widest mb-3 uppercase">Specific Year</p>
        <div className="bg-[#130018] rounded-2xl p-4 border border-[#FF6B9D]/10 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[#D4A0BA] text-sm">Year</span>
            <span className="text-[#FF6B9D] font-black text-2xl">{timeMachineYear}</span>
          </div>
          <input type="range" min={1970} max={2024} value={timeMachineYear}
            onChange={e => setTimeMachineYear(Number(e.target.value))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer mb-3"
            style={{ accentColor: '#FF6B9D', background: `linear-gradient(to right,#FF6B9D ${(timeMachineYear-1970)/54*100}%,#2A0038 ${(timeMachineYear-1970)/54*100}%)` }}
          />
          <motion.button whileTap={{ scale: 0.97 }} onClick={() => fetchSongs(timeMachineYear)}
            className="w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg,#FF6B9D,#C2185B)' }}>
            <Clock size={16} /> {timeMachineYear} ke Songs Suno
          </motion.button>
        </div>

        {/* Results */}
        {loading && (
          <div className="flex justify-center py-8">
            <div className="flex flex-col items-center gap-3">
              <Loader2 size={32} className="text-[#FF6B9D] animate-spin" />
              <p className="text-[#D4A0BA] text-sm">{timeMachineYear} ke songs dhoondh rahe hain... ⏰</p>
            </div>
          </div>
        )}

        {!loading && searched && songs.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-white font-bold text-base">🕐 {timeMachineYear} ke Hits</p>
              <motion.button whileTap={{ scale: 0.95 }}
                onClick={() => playSong(songs[0], songs)}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-white font-bold text-sm"
                style={{ background: 'linear-gradient(135deg,#FF6B9D,#C2185B)' }}>
                <Play size={14} fill="white" /> Play All
              </motion.button>
            </div>
            <div className="flex overflow-x-auto gap-5 pb-4 no-scrollbar -mx-4 px-4">
              {songs.map((song, i) => (
                <SongCard key={i} item={song} onPlay={() => playSong(song, songs)} />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
