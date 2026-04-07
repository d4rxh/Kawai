import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Play, Pause, Check, X, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePlayerStore } from '../store/playerStore';
import { api, getImageUrl } from '../services/api';

type QState = 'idle'|'playing'|'answered'|'finished';

export const MusicQuiz: React.FC = () => {
  const navigate = useNavigate();
  const { incrementChallenge } = usePlayerStore();
  const audioRef = useRef<HTMLAudioElement>(null);

  const [songs, setSongs]     = useState<any[]>([]);
  const [qIdx, setQIdx]       = useState(0);
  const [score, setScore]     = useState(0);
  const [qState, setQState]   = useState<QState>('idle');
  const [chosen, setChosen]   = useState<string|null>(null);
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<string[]>([]);
  const [correctAns, setCorrectAns] = useState('');
  const [isPlaying, setIsPlaying]   = useState(false);

  const GENRES = ['bollywood hindi hits','pop english','punjabi trending','romantic hindi'];

  const loadQuiz = async () => {
    setLoading(true);
    try {
      const genre = GENRES[Math.floor(Math.random()*GENRES.length)];
      const res = await api.searchSongs(genre);
      const shuffled = res.sort(() => Math.random()-0.5).slice(0,8);
      setSongs(shuffled);
      setQIdx(0); setScore(0); setQState('playing'); setChosen(null);
      setupOptions(shuffled, 0);
    } finally { setLoading(false); }
  };

  const setupOptions = (songList: any[], idx: number) => {
    const correct = songList[idx];
    const others  = songList.filter((_,i) => i !== idx)
                            .sort(() => Math.random()-0.5).slice(0,3);
    const all = [...others.map(s=>s.artists?.primary?.[0]?.name||'Unknown'), correct.artists?.primary?.[0]?.name||'Unknown']
                .sort(() => Math.random()-0.5);
    setOptions(all);
    setCorrectAns(correct.artists?.primary?.[0]?.name||'Unknown');
  };

  const togglePreview = () => {
    if (!audioRef.current || qState !== 'playing') return;
    const song = songs[qIdx];
    const url = song?.downloadUrl?.find((d:any)=>d.quality==='96kbps')?.url || song?.downloadUrl?.[0]?.url;
    if (!url) return;
    if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); }
    else { audioRef.current.src = url; audioRef.current.play(); setIsPlaying(true); }
  };

  const handleAnswer = (ans: string) => {
    if (qState !== 'playing') return;
    setChosen(ans);
    setQState('answered');
    setIsPlaying(false);
    audioRef.current?.pause();
    if (ans === correctAns) { setScore(s=>s+1); incrementChallenge('quiz_correct'); }
  };

  const nextQ = () => {
    const next = qIdx+1;
    if (next >= songs.length) { setQState('finished'); return; }
    setQIdx(next); setChosen(null); setQState('playing'); setIsPlaying(false);
    setupOptions(songs, next);
  };

  const song = songs[qIdx];

  return (
    <div className="min-h-full flex flex-col pb-32" style={{ background: '#0A000F' }}>
      <audio ref={audioRef} onEnded={()=>setIsPlaying(false)}/>

      <div className="sticky top-0 z-20 flex items-center justify-between px-4 py-4"
        style={{ background: 'linear-gradient(to bottom,#0A000F,transparent)' }}>
        <button onClick={()=>navigate(-1)} className="p-2 rounded-full bg-[#2A0038] text-white"><ArrowLeft size={20}/></button>
        <div className="text-center">
          <h1 className="text-white font-black text-lg">🎵 Music Quiz</h1>
          {qState!=='idle'&&qState!=='finished'&&<p className="text-[#D4A0BA] text-xs">{qIdx+1}/{songs.length} • Score: {score}</p>}
        </div>
        <div className="w-10"/>
      </div>

      <div className="flex-1 px-4">
        {qState==='idle'&&(
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
            <div className="text-8xl">🎵</div>
            <h2 className="text-white font-black text-2xl text-center">Artist Guess Karo!</h2>
            <p className="text-[#D4A0BA] text-center text-sm max-w-xs">Song suno aur artist ka naam batao. Jitne zyada sahi utna score zyada!</p>
            <motion.button whileTap={{scale:0.97}} onClick={loadQuiz} disabled={loading}
              className="px-8 py-4 rounded-2xl font-bold text-white text-lg"
              style={{background:'linear-gradient(135deg,#FF6B9D,#C2185B)'}}>
              {loading ? 'Loading...' : '🎮 Start Quiz!'}
            </motion.button>
          </motion.div>
        )}

        {(qState==='playing'||qState==='answered') && song && (
          <AnimatePresence mode="wait">
            <motion.div key={qIdx} initial={{opacity:0,x:30}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-30}} className="space-y-5 pt-2">
              {/* Song info (blurred during play, revealed after answer) */}
              <div className="relative rounded-3xl overflow-hidden aspect-square max-w-[240px] mx-auto border-2 border-[#FF6B9D]/20">
                <img src={getImageUrl(song.image)} alt="" className={`w-full h-full object-cover transition-all duration-500 ${qState==='playing'?'blur-xl scale-110':''}`}/>
                {qState==='playing'&&(
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.button whileTap={{scale:0.9}} onClick={togglePreview}
                      className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/40 flex items-center justify-center">
                      {isPlaying ? <Pause size={32} className="text-white"/> : <Play size={32} className="text-white ml-1"/>}
                    </motion.button>
                  </div>
                )}
                {qState==='answered'&&(
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-3 text-center">
                    <p className="text-white font-bold text-sm truncate">{song.name}</p>
                  </div>
                )}
              </div>

              {isPlaying && qState==='playing' && (
                <div className="flex justify-center gap-1 h-8 items-end">
                  {[...Array(16)].map((_,i)=>(
                    <div key={i} className="w-1.5 rounded-full bg-[#FF6B9D]"
                      style={{height:`${30+Math.abs(Math.sin(Date.now()/200+i)*40)}%`, animation:`bounce 0.6s ${i*0.05}s ease-in-out infinite alternate`}}/>
                  ))}
                </div>
              )}

              {qState==='playing'&&<p className="text-center text-[#D4A0BA] text-sm">🎧 Suno aur artist guess karo</p>}

              <div className="grid grid-cols-2 gap-3">
                {options.map((opt,i)=>{
                  let cls='border-[#FF6B9D]/15 bg-[#130018] text-white';
                  if(qState==='answered'){
                    if(opt===correctAns) cls='border-green-500/60 bg-green-500/15 text-green-400';
                    else if(opt===chosen&&opt!==correctAns) cls='border-red-500/60 bg-red-500/15 text-red-400';
                    else cls='border-white/5 bg-[#130018]/50 text-white/30';
                  }
                  return(
                    <motion.button key={i} whileTap={{scale:0.97}} onClick={()=>handleAnswer(opt)}
                      disabled={qState==='answered'}
                      className={`p-4 rounded-2xl border font-bold text-sm text-left transition-all flex items-center gap-2 ${cls}`}>
                      {qState==='answered'&&opt===correctAns&&<Check size={14} className="text-green-400 shrink-0"/>}
                      {qState==='answered'&&opt===chosen&&opt!==correctAns&&<X size={14} className="text-red-400 shrink-0"/>}
                      {opt}
                    </motion.button>
                  );
                })}
              </div>

              {qState==='answered'&&(
                <motion.button initial={{opacity:0}} animate={{opacity:1}} whileTap={{scale:0.97}} onClick={nextQ}
                  className="w-full py-3 rounded-2xl font-bold text-white"
                  style={{background:'linear-gradient(135deg,#FF6B9D,#C2185B)'}}>
                  {qIdx+1<songs.length ? 'Agle Question ➡️' : 'Results Dekho 🏆'}
                </motion.button>
              )}
            </motion.div>
          </AnimatePresence>
        )}

        {qState==='finished'&&(
          <motion.div initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} className="flex flex-col items-center gap-5 pt-8">
            <div className="text-7xl">{score>=songs.length*0.8?'🏆':score>=songs.length*0.5?'🥈':'🌸'}</div>
            <h2 className="text-white font-black text-3xl">{score}/{songs.length}</h2>
            <p className="text-[#D4A0BA] text-center">
              {score===songs.length?'Perfect! Tum real music expert ho! 🎵':
               score>=songs.length*0.6?'Bahut acha! Music ka acha knowledge hai!':
               'Thoda practice karo! Try again karo 😊'}
            </p>
            <div className="flex gap-3">
              <motion.button whileTap={{scale:0.97}} onClick={loadQuiz}
                className="px-6 py-3 rounded-2xl font-bold text-white"
                style={{background:'linear-gradient(135deg,#FF6B9D,#C2185B)'}}>
                Phir Khelna 🎮
              </motion.button>
              <button onClick={()=>navigate(-1)} className="px-6 py-3 rounded-2xl border border-[#FF6B9D]/30 text-white/70 font-bold">
                Back
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
