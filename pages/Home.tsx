import React, { useEffect, useState, useCallback, useMemo, memo } from 'react';
import { api, getImageUrl } from '../services/api';
import { Song, Album } from '../types';
import { usePlayerStore } from '../store/playerStore';
import { Bell, History, Settings, Play, UserCircle, WifiOff, Rocket, TrendingUp, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SongCard } from '../components/SongCard';
import { SakuraFortune } from '../components/SakuraFortune';
import { VibeCheck } from '../components/VibeCheck';
import { ChallengesButton } from '../components/Challenges';
import { motion, Variants } from 'motion/react';

// Animation Variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

// Skeleton Component
const SkeletonCard: React.FC<{ round?: boolean }> = ({ round = false }) => (
  <div className="bg-transparent w-[140px] md:w-[160px] shrink-0 animate-pulse">
    <div className={`w-full aspect-square mb-3 bg-[#130018] ${round ? 'rounded-full' : 'rounded-md'}`}></div>
    <div className="flex flex-col gap-2">
      <div className="h-3 bg-[#2A0038] rounded-full w-3/4"></div>
      <div className="h-2 bg-[#130018] rounded-full w-1/2"></div>
    </div>
  </div>
);

const SkeletonShortcut: React.FC = () => (
  <div className="flex items-center gap-0 h-[56px] overflow-hidden rounded-md bg-[#130018] animate-pulse">
     <div className="h-full w-[56px] bg-[#2A0038] shrink-0"></div>
     <div className="flex-1 px-3">
         <div className="h-2.5 bg-[#2A0038] rounded-full w-3/4"></div>
     </div>
  </div>
);

export const Home: React.FC = () => {
  const [daylist, setDaylist] = useState<Song[]>([]);
  const [recent, setRecent] = useState<(Song | Album)[]>([]); 
  const { history, playSong, currentUser, isOfflineMode, downloadedSongIds, likedSongs, getTopSongs, artistPlayCounts, playCounts, listeningStreak, dailyMixes, generateDailyMixes, addToQueue } = usePlayerStore();
  const [algoRecs, setAlgoRecs] = useState<Song[]>([]);
  const [algoArtistRecs, setAlgoArtistRecs] = useState<Song[]>([]);
  const [moodSongs, setMoodSongs] = useState<{ mood: string; emoji: string; songs: Song[]; color: string }[]>([]);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    // Only fetch if online
    if (isOfflineMode) {
        setIsLoading(false);
        // Load local content for offline view
        const offlineSongs = likedSongs.filter(s => downloadedSongIds.includes(s.id));
        setDaylist(offlineSongs);
        return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      const hour = new Date().getHours();
      let query = 'Top Hits 2024';
      if (hour >= 5 && hour < 12) query = 'Morning Acoustic';
      else if (hour >= 12 && hour < 17) query = 'Upbeat Pop';
      else query = 'Late Night Vibes';

      try {
        const songs = await api.searchSongs(query);
        // Artificial delay for smoothness if network is too fast (prevents flicker)
        await new Promise(r => setTimeout(r, 400));
        setDaylist(songs);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();

    // Algorithm: fetch recommendations from top played artists
    const fetchAlgoRecs = async () => {
      try {
        const topSongs = getTopSongs();
        const topArtistEntries = Object.entries(artistPlayCounts)
          .sort(([,a],[,b]) => b - a).slice(0, 3);

        if (topArtistEntries.length > 0) {
          const [topArtistId] = topArtistEntries[0];
          // Search songs from top played artist by finding artist name in history
          const artistSong = history.find(s =>
            s.artists?.primary?.some(a => a.id === topArtistId)
          );
          if (artistSong) {
            const artistName = artistSong.artists.primary[0]?.name;
            const recs = await api.searchSongs(artistName + ' best songs');
            const playedIds = new Set(topSongs.map(s => s.id));
            setAlgoArtistRecs(recs.filter(s => !playedIds.has(s.id)).slice(0, 10));
          }
        }

        // Also recommend by most-played song style
        if (topSongs.length > 0) {
          const top = topSongs[0];
          const genre = top.genre || top.language;
          if (genre) {
            const genreRecs = await api.searchSongs(genre + ' popular');
            setAlgoRecs(genreRecs.slice(0, 10));
          }
        }
      } catch(e) { console.error(e); }
    };

    if (!isOfflineMode && Object.keys(artistPlayCounts).length > 0) {
      fetchAlgoRecs();
    }

    // Generate daily mixes
    generateDailyMixes();

    // Fetch mood playlists
    if (!isOfflineMode) {
      const MOODS = [
        { mood: 'Happy', emoji: '😊', query: 'happy upbeat pop 2024', color: '#F59E0B' },
        { mood: 'Chill', emoji: '😌', query: 'lofi chill study beats', color: '#06B6D4' },
        { mood: 'Workout', emoji: '💪', query: 'workout gym energy', color: '#EF4444' },
        { mood: 'Sad', emoji: '😢', query: 'sad emotional heartbreak', color: '#A855F7' },
        { mood: 'Party', emoji: '🎉', query: 'party dance edm hits', color: '#FF6B9D' },
        { mood: 'Focus', emoji: '📚', query: 'focus study instrumental', color: '#10B981' },
      ];
      Promise.all(MOODS.map(m => api.searchSongs(m.query).then(songs => ({ ...m, songs: songs.slice(0,10) }))))
        .then(results => setMoodSongs(results))
        .catch(() => {});
    }
  }, [isOfflineMode]);

  useEffect(() => {
    // Populate recent with history or default items
    if (history.length > 0) {
      setRecent(history.slice(0, 6));
    } else if (!isOfflineMode) {
       // Defaults to populate the grid if empty history
       Promise.all([
         api.searchSongs("The Weeknd"),
         api.searchAlbums("Starboy"),
         api.searchSongs("Taylor Swift"),
         api.searchAlbums("1989"),
       ]).then(([songs, albums, songs2, albums2]) => {
          setRecent([...songs.slice(0,1), ...albums.slice(0,1), ...songs2.slice(0,1), ...albums2.slice(0,1)]);
       });
    }
  }, [history, isOfflineMode]);

  // Scroll listener for header effect (Attached to main container)
  useEffect(() => {
    const main = document.querySelector('main');
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (main) setIsScrolled(main.scrollTop > 10);
          ticking = false;
        });
        ticking = true;
      }
    };
    main?.addEventListener('scroll', handleScroll, { passive: true });
    return () => main?.removeEventListener('scroll', handleScroll);
  }, []);

  const ShortcutCard = memo(({ title, image, specialType, onClick }: { title: string, image?: string, specialType?: 'liked', onClick?: () => void }) => (
    <motion.div 
        whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className="flex items-center gap-0 cursor-pointer h-[56px] overflow-hidden group rounded-md bg-[#130018] transition-colors"
    >
        {specialType === 'liked' ? (
            <div className="h-full w-[56px] bg-[#450af5] flex items-center justify-center shrink-0">
                <svg role="img" height="24" width="24" aria-hidden="true" viewBox="0 0 24 24" fill="white"><path d="M15.724 4.22A4.313 4.313 0 0 0 12.192.814a4.269 4.269 0 0 0-3.622 1.13.837.837 0 0 1-1.14 0 4.272 4.272 0 0 0-6.21 5.855l5.916 7.05a1.128 1.128 0 0 0 1.727 0l5.916-7.05a4.228 4.228 0 0 0 .945-3.577z"></path></svg>
            </div>
        ) : (
            <img src={image} className="h-full w-[56px] object-cover shrink-0" alt=""/>
        )}
        <div className="flex flex-1 items-center justify-between px-3 overflow-hidden">
             <span className="font-medium text-[13px] leading-tight line-clamp-2 text-white">{title}</span>
        </div>
    </motion.div>
  ));

  const SectionTitle = ({ title, style }: { title: string, style?: React.CSSProperties }) => (
      <h2 className="text-xl font-bold mb-4 text-white px-6 tracking-tight" style={style}>{title}</h2>
  );

  const handleProfileClick = () => {
    if (currentUser) {
        navigate('/profile');
    } else {
        navigate('/login');
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`flex flex-col gap-8 min-h-full pb-36 relative bg-transparent`}
    >
      
      {/* Top Header */}
      <div className={`px-6 flex items-center justify-start gap-4 sticky top-0 z-50 py-4 transition-all duration-300 ${isScrolled ? 'bg-[#0A000F]' : 'bg-transparent'}`}>
         {/* Profile Icon */}
         <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleProfileClick}
            className="w-8 h-8 rounded-full bg-[#2A0038] flex items-center justify-center font-bold text-white text-sm shrink-0 cursor-pointer overflow-hidden"
         >
             {currentUser && currentUser.image ? (
                 <img src={currentUser.image} alt="Profile" className="w-full h-full object-cover" />
             ) : (
                 <span className="font-bold">{currentUser ? currentUser.name.charAt(0).toUpperCase() : <UserCircle size={20} />}</span>
             )}
         </motion.div>
         
         {/* Filter Chips + Feature Buttons */}
         <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
             {!isOfflineMode && (
                <>
                    <motion.button whileTap={{ scale: 0.95 }} className="px-4 py-1.5 bg-white text-black rounded-full text-[13px] font-medium whitespace-nowrap shrink-0">All</motion.button>
                    <motion.button whileTap={{ scale: 0.95 }} onClick={() => navigate('/time-machine')} className="px-4 py-1.5 bg-[#2A0038] text-white rounded-full text-[13px] font-medium whitespace-nowrap hover:bg-[#3D0050] shrink-0 flex items-center gap-1">⏰ Time Machine</motion.button>
                </>
             )}
             {isOfflineMode && (
                 <motion.button className="px-4 py-1.5 bg-[#2A0038] text-white rounded-full text-[13px] font-medium flex items-center gap-2 shrink-0">
                     <WifiOff size={14} /> Offline Mode
                 </motion.button>
             )}
         </div>
      </div>

      {/* Grid Shortcuts */}
      <motion.div variants={itemVariants} className="px-6 mt-2">
          <h2 className="text-2xl font-bold text-white mb-4 tracking-tight">{isOfflineMode ? "Your Downloads" : "Jump back in"}</h2>
          <div className="grid grid-cols-2 gap-3">
            <ShortcutCard title="Liked Songs" specialType="liked" onClick={() => navigate('/library')} />
            
            {!isOfflineMode && isLoading ? (
                Array(5).fill(0).map((_, i) => <SkeletonShortcut key={i} />)
            ) : !isOfflineMode ? (
                recent.slice(0, 5).map((item, idx) => (
                    <ShortcutCard 
                        key={item.id + idx} 
                        title={item.name} 
                        image={getImageUrl(item.image)}
                        onClick={() => item.type === 'song' ? playSong(item as Song, [item as Song]) : navigate(`/album/${item.id}`)}
                    />
                ))
            ) : null}
          </div>
      </motion.div>

      {/* Recommended / Downloaded Section */}
      <motion.section variants={itemVariants} className="mt-4">
        <SectionTitle title={isOfflineMode ? "Downloaded Music" : "Made For You"} />
        <div className="flex overflow-x-auto gap-6 pb-6 no-scrollbar px-6 snap-x">
            {isLoading && !isOfflineMode ? (
                 Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)
            ) : daylist.length > 0 ? (
                 daylist.map((item, i) => (
                    <div key={i} className="snap-start">
                        <SongCard item={item} onPlay={() => playSong(item, daylist)} />
                    </div>
                 ))
            ) : (
                <div className="text-white/60 px-6 text-base font-medium">
                    {isOfflineMode ? "No downloaded music available." : "No recommendations yet."}
                </div>
            )}
        </div>
      </motion.section>

      {/* Hide online sections if offline */}
      {!isOfflineMode && (
          <>
            <motion.section variants={itemVariants}>
                <SectionTitle title="Your favorite artists" />
                <div className="flex overflow-x-auto gap-6 pb-6 no-scrollbar px-6 snap-x">
                    {isLoading ? (
                        Array(6).fill(0).map((_, i) => <SkeletonCard key={i} round={true} />)
                    ) : (
                        daylist.slice(0,6).map((item, i) => (
                            <div key={i} className="snap-start">
                                <SongCard item={item} round={true} />
                            </div>
                        ))
                    )}
                </div>
            </motion.section>
            
            <motion.section variants={itemVariants}>
                <SectionTitle title="Recently played" />
                <div className="flex overflow-x-auto gap-6 pb-6 no-scrollbar px-6 snap-x">
                    {isLoading ? (
                        Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
                    ) : recent.length > 0 ? (
                        recent.map((item, i) => (
                            <div key={i} className="snap-start">
                                <SongCard item={item} onPlay={() => item.type === 'song' && playSong(item as Song, [item as Song])} />
                            </div>
                        ))
                    ) : (
                        <div className="text-white/60 text-base font-medium px-6 h-[100px] flex items-center">Play some music to see it here.</div>
                    )}
                </div>
            </motion.section>
          </>
      )}

      {/* Listening Streak */}
      {listeningStreak > 1 && (
        <motion.div variants={itemVariants} className="mx-6">
          <div className="rounded-2xl p-4 border border-[#FF6B9D]/20 flex items-center gap-4"
            style={{ background: 'linear-gradient(135deg,rgba(255,107,157,0.15),rgba(194,24,91,0.1))' }}>
            <div className="text-4xl">🔥</div>
            <div>
              <p className="text-white font-bold text-base">{listeningStreak} Din Ka Streak!</p>
              <p className="text-[#D4A0BA] text-xs">Aaj bhi suno streak maintain karo 🌸</p>
            </div>
            <div className="ml-auto text-[#FF6B9D] font-black text-2xl">{listeningStreak}</div>
          </div>
        </motion.div>
      )}

      {/* Fortune + Vibe + Challenges Row */}
      {!isOfflineMode && (
        <motion.div variants={itemVariants} className="px-6 flex gap-3 overflow-x-auto no-scrollbar">
          <SakuraFortune />
          <VibeCheck />
          <ChallengesButton />
        </motion.div>
      )}

      {/* Daily Mixes */}
      {!isOfflineMode && dailyMixes.length > 0 && (
        <motion.section variants={itemVariants}>
          <div className="flex items-center gap-2 px-6 mb-4">
            <span className="text-lg">🎵</span>
            <h2 className="text-xl font-bold text-white tracking-tight">Tumhara Daily Mix</h2>
          </div>
          <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar px-6">
            {dailyMixes.map((mix, i) => (
              <motion.div key={mix.id} whileTap={{ scale: 0.96 }}
                className="shrink-0 w-[150px] cursor-pointer rounded-2xl overflow-hidden"
                onClick={() => {
                  const q = history.filter(s => s.artists?.primary?.some(a => a.id === mix.seeds[0])).slice(0,15);
                  if (q.length > 0) playSong(q[0], q);
                }}
              >
                <div className="aspect-square flex items-center justify-center relative overflow-hidden rounded-xl"
                  style={{ background: `linear-gradient(135deg, ${mix.color}99, ${mix.color}33)` }}>
                  <div className="grid grid-cols-2 gap-1 p-2 w-full h-full">
                    {history.filter(s => s.artists?.primary?.some(a => a.id === mix.seeds[0])).slice(0,4).map((s,j) => (
                      <img key={j} src={s.image?.[1]?.url || s.image?.[0]?.url} alt=""
                        className="w-full aspect-square object-cover rounded-lg" />
                    ))}
                    {Array.from({ length: Math.max(0, 4 - history.filter(s => s.artists?.primary?.some(a => a.id === mix.seeds[0])).length) })
                      .map((_,j) => <div key={`ph-${j}`} className="w-full aspect-square rounded-lg bg-white/10" />)
                    }
                  </div>
                  <div className="absolute bottom-2 right-2 w-8 h-8 rounded-full flex items-center justify-center bg-black/60">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="white"><polygon points="2,1 11,6 2,11"/></svg>
                  </div>
                </div>
                <p className="text-white font-bold text-sm mt-2 truncate">{mix.title}</p>
                <p className="text-[#D4A0BA] text-xs truncate opacity-70">{(mix as any).artistName || 'Mixed'}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Mood Playlists */}
      {!isOfflineMode && moodSongs.length > 0 && (
        <motion.section variants={itemVariants}>
          <div className="flex items-center gap-2 px-6 mb-4">
            <span className="text-lg">🎭</span>
            <h2 className="text-xl font-bold text-white tracking-tight">Mood ke Hisaab se</h2>
          </div>
          <div className="grid grid-cols-3 gap-3 px-6">
            {moodSongs.map(({ mood, emoji, songs, color }) => (
              <motion.div key={mood} whileTap={{ scale: 0.95 }}
                className="rounded-2xl p-3 flex flex-col items-center gap-2 cursor-pointer border border-white/5"
                style={{ background: `linear-gradient(135deg, ${color}30, ${color}10)`, borderColor: `${color}30` }}
                onClick={() => songs.length > 0 && playSong(songs[0], songs)}
              >
                <span className="text-2xl">{emoji}</span>
                <span className="text-white text-xs font-bold">{mood}</span>
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Algorithm Recommendations - Only show if we have listening data */}
      {!isOfflineMode && algoArtistRecs.length > 0 && (
        <motion.section variants={itemVariants}>
          <div className="flex items-center gap-2 px-6 mb-4">
            <Star size={18} className="text-[#FF6B9D]" />
            <h2 className="text-xl font-bold text-white tracking-tight">Tumhare liye — Artist ke Hisaab se</h2>
          </div>
          <div className="flex overflow-x-auto gap-6 pb-6 no-scrollbar px-6 snap-x">
            {algoArtistRecs.map((item, i) => (
              <div key={i} className="snap-start">
                <SongCard item={item} onPlay={() => playSong(item, algoArtistRecs)} />
              </div>
            ))}
          </div>
        </motion.section>
      )}

      {!isOfflineMode && algoRecs.length > 0 && (
        <motion.section variants={itemVariants}>
          <div className="flex items-center gap-2 px-6 mb-4">
            <TrendingUp size={18} className="text-[#FF6B9D]" />
            <h2 className="text-xl font-bold text-white tracking-tight">Teri Trending — Taste Match</h2>
          </div>
          <div className="flex overflow-x-auto gap-6 pb-6 no-scrollbar px-6 snap-x">
            {algoRecs.map((item, i) => (
              <div key={i} className="snap-start">
                <SongCard item={item} onPlay={() => playSong(item, algoRecs)} />
              </div>
            ))}
          </div>
        </motion.section>
      )}


      {/* 🎮 Games Section */}
      {!isOfflineMode && (
        <motion.section variants={itemVariants}>
          <div className="flex items-center gap-2 px-6 mb-4">
            <span className="text-lg">🎮</span>
            <h2 className="text-xl font-bold text-white tracking-tight">Music Games</h2>
          </div>
          <div className="flex gap-4 px-6 overflow-x-auto no-scrollbar pb-2">
            {[
              { emoji:'🎵', title:'Music Quiz', desc:'Artist guess karo', path:'/quiz', color:'#FF6B9D' },
              { emoji:'⚔️', title:'Song Duel', desc:'Vote karo winner', path:'/duel', color:'#A855F7' },
              { emoji:'⏰', title:'Time Machine', desc:'Kisi bhi saal ke hits', path:'/time-machine', color:'#06B6D4' },
            ].map(g => (
              <motion.div key={g.path} whileTap={{ scale: 0.96 }}
                onClick={() => navigate(g.path)}
                className="shrink-0 w-[140px] rounded-2xl p-4 cursor-pointer border border-white/5"
                style={{ background: `linear-gradient(135deg,${g.color}25,${g.color}08)`, borderColor: `${g.color}25` }}>
                <div className="text-4xl mb-2">{g.emoji}</div>
                <p className="text-white font-bold text-sm">{g.title}</p>
                <p className="text-white/40 text-xs">{g.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

    </motion.div>
  );
};