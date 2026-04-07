import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Swords, RefreshCw, Play, Pause } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePlayerStore } from '../store/playerStore';
import { api, getImageUrl } from '../services/api';

export const SongDuel: React.FC = () => {
  const navigate = useNavigate();
  const { playSong } = usePlayerStore();
  const [songA, setSongA] = useState<any>(null);
  const [songB, setSongB] = useState<any>(null);
  const [winner, setWinner] = useState<'A'|'B'|null>(null);
  const [loading, setLoading] = useState(false);
  const [votesA, setVotesA] = useState(0);
  const [votesB, setVotesB] = useState(0);
  const [totalDuels, setTotalDuels] = useState(0);
  const audioARef = useRef<HTMLAudioElement>(null);
  const audioBRef = useRef<HTMLAudioElement>(null);
  const [playingA, setPlayingA] = useState(false);
  const [playingB, setPlayingB] = useState(false);

  const loadDuel = async () => {
    setLoading(true); setWinner(null); setPlayingA(false); setPlayingB(false);
    audioARef.current?.pause(); audioBRef.current?.pause();
    try {
      const genres = ['hindi hits','pop songs','punjabi','romantic','bollywood'];
      const g = genres[Math.floor(Math.random()*genres.length)];
      const songs = await api.searchSongs(g);
      const shuffled = songs.sort(()=>Math.random()-0.5);
      setSongA(shuffled[0]); setSongB(shuffled[1]);
    } finally { setLoading(false); }
  };

  const vote = (side: 'A'|'B') => {
    if (winner) return;
    setWinner(side);
    setTotalDuels(t=>t+1);
    if (side==='A') setVotesA(v=>v+1);
    else setVotesB(v=>v+1);
    audioARef.current?.pause(); audioBRef.current?.pause();
    setPlayingA(false); setPlayingB(false);
  };

  const togglePlay = (side: 'A'|'B') => {
    const song = side==='A' ? songA : songB;
    const ref  = side==='A' ? audioARef : audioBRef;
    const other = side==='A' ? audioBRef : audioARef;
    const playing = side==='A' ? playingA : playingB;
    if (!ref.current || !song) return;
    const url = song.downloadUrl?.find((d:any)=>d.quality==='96kbps')?.url || song.downloadUrl?.[0]?.url;
    if (!url) return;
    other.current?.pause();
    if (side==='A') setPlayingB(false); else setPlayingA(false);
    if (playing) { ref.current.pause(); if(side==='A') setPlayingA(false); else setPlayingB(false); }
    else { ref.current.src=url; ref.current.play(); if(side==='A') setPlayingA(true); else setPlayingB(true); }
  };

  const SongCard = ({ song, side, isPlaying }: { song: any; side: 'A'|'B'; isPlaying: boolean }) => {
    const isWinner = winner===side;
    const isLoser  = winner && winner!==side;
    const totalVotes = votesA+votesB;
    const votes = side==='A' ? votesA : votesB;
    const pct = totalVotes ? Math.round(votes/totalVotes*100) : 50;

    return (
      <motion.div className={`flex-1 rounded-3xl border-2 overflow-hidden transition-all duration-500 ${
        isWinner ? 'border-[#F59E0B]/60 scale-105' : isLoser ? 'border-white/5 opacity-50' : 'border-[#FF6B9D]/20'
      }`} style={{ background: isWinner ? 'linear-gradient(180deg,rgba(245,158,11,0.15),rgba(10,0,15,0.9))' : 'rgba(19,0,24,0.8)' }}>
        <div className="relative aspect-square">
          <img src={getImageUrl(song.image)} alt="" className="w-full h-full object-cover"/>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"/>
          {isWinner && <div className="absolute top-3 right-3 text-3xl">👑</div>}
          <motion.button whileTap={{scale:0.9}}
            onClick={()=>togglePlay(side)}
            className="absolute bottom-3 left-3 w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
            {isPlaying ? <Pause size={16} className="text-white"/> : <Play size={16} className="text-white ml-0.5"/>}
          </motion.button>
        </div>
        <div className="p-3">
          <p className="text-white font-bold text-sm truncate">{song.name}</p>
          <p className="text-[#D4A0BA] text-xs truncate">{song.artists?.primary?.[0]?.name}</p>
          {winner && (
            <div className="mt-2">
              <div className="flex justify-between text-xs mb-1">
                <span className={isWinner?'text-[#F59E0B] font-bold':'text-white/40'}>{pct}%</span>
              </div>
              <div className="h-1.5 bg-[#2A0038] rounded-full overflow-hidden">
                <motion.div initial={{width:0}} animate={{width:`${pct}%`}} transition={{duration:0.8}}
                  className="h-full rounded-full" style={{background: isWinner ? '#F59E0B' : '#FF6B9D'}}/>
              </div>
            </div>
          )}
          {!winner && (
            <motion.button whileTap={{scale:0.97}} onClick={()=>vote(side)}
              className="mt-3 w-full py-2.5 rounded-xl font-bold text-white text-sm"
              style={{background:'linear-gradient(135deg,#FF6B9D,#C2185B)'}}>
              Vote {side==='A'?'👆 A':'👆 B'}
            </motion.button>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-full flex flex-col pb-32" style={{ background: '#0A000F' }}>
      <audio ref={audioARef} onEnded={()=>setPlayingA(false)}/>
      <audio ref={audioBRef} onEnded={()=>setPlayingB(false)}/>

      <div className="sticky top-0 z-20 flex items-center justify-between px-4 py-4" style={{background:'linear-gradient(to bottom,#0A000F,transparent)'}}>
        <button onClick={()=>navigate(-1)} className="p-2 rounded-full bg-[#2A0038] text-white"><ArrowLeft size={20}/></button>
        <div className="text-center">
          <h1 className="text-white font-black text-lg flex items-center gap-2 justify-center"><Swords size={18} className="text-[#FF6B9D]"/> Song Duel</h1>
          {totalDuels>0&&<p className="text-[#D4A0BA] text-xs">{totalDuels} duels played</p>}
        </div>
        <div className="w-10"/>
      </div>

      <div className="flex-1 px-4">
        {!songA && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
            <div className="text-7xl">⚔️</div>
            <h2 className="text-white font-black text-2xl text-center">2 Songs — 1 Winner!</h2>
            <p className="text-[#D4A0BA] text-center text-sm max-w-xs">Dono songs suno, apna favorite choose karo!</p>
            <motion.button whileTap={{scale:0.97}} onClick={loadDuel} disabled={loading}
              className="px-8 py-4 rounded-2xl font-bold text-white text-lg"
              style={{background:'linear-gradient(135deg,#FF6B9D,#C2185B)'}}>
              {loading?'Loading...':'⚔️ Start Duel!'}
            </motion.button>
          </div>
        )}

        {songA && songB && (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3 py-2">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#FF6B9D]/40"/>
              <Swords size={24} className="text-[#FF6B9D]"/>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#FF6B9D]/40"/>
            </div>
            <div className="flex gap-3">
              <SongCard song={songA} side="A" isPlaying={playingA}/>
              <div className="flex items-center font-black text-[#FF6B9D] text-xl">VS</div>
              <SongCard song={songB} side="B" isPlaying={playingB}/>
            </div>
            {winner && (
              <motion.button initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} whileTap={{scale:0.97}} onClick={loadDuel}
                className="w-full py-3 rounded-2xl font-bold text-white flex items-center justify-center gap-2"
                style={{background:'linear-gradient(135deg,#FF6B9D,#C2185B)'}}>
                <RefreshCw size={16}/> Naya Duel!
              </motion.button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
