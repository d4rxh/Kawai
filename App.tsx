import React, { useEffect, useRef, useState, lazy, Suspense } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { FloatingNav } from './components/FloatingNav';
import { useUiStore } from './store/uiStore';
import { Player } from './components/Player';
import { AudioController } from './components/AudioController';
import { DownloadProgress } from './components/DownloadProgress';

const Home          = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const Search        = lazy(() => import('./pages/Search').then(m => ({ default: m.Search })));
const Library       = lazy(() => import('./pages/Library').then(m => ({ default: m.Library })));
const AlbumDetails  = lazy(() => import('./pages/AlbumDetails').then(m => ({ default: m.AlbumDetails })));
const ArtistDetails = lazy(() => import('./pages/ArtistDetails').then(m => ({ default: m.ArtistDetails })));
const LoginPromo    = lazy(() => import('./pages/LoginPromo').then(m => ({ default: m.LoginPromo })));
const LikedSongs    = lazy(() => import('./pages/LikedSongs').then(m => ({ default: m.LikedSongs })));
const PlaylistDetails = lazy(() => import('./pages/PlaylistDetails').then(m => ({ default: m.PlaylistDetails })));
const Login         = lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const Signup        = lazy(() => import('./pages/Signup').then(m => ({ default: m.Signup })));
const Profile       = lazy(() => import('./pages/Profile').then(m => ({ default: m.Profile })));
const Social        = lazy(() => import('./pages/Social').then(m => ({ default: m.Social })));
const ArtistSelection = lazy(() => import('./pages/ArtistSelection').then(m => ({ default: m.ArtistSelection })));
const TimeMachine     = lazy(() => import('./pages/TimeMachine').then(m => ({ default: m.TimeMachine })));
const WrappedCard     = lazy(() => import('./pages/WrappedCard').then(m => ({ default: m.WrappedCard })));
const MusicQuiz       = lazy(() => import('./pages/MusicQuiz').then(m => ({ default: m.MusicQuiz })));
const SongDuel        = lazy(() => import('./pages/SongDuel').then(m => ({ default: m.SongDuel })));
import { motion, AnimatePresence } from 'motion/react';
import { usePlayerStore } from './store/playerStore';
import { WifiOff } from 'lucide-react';
import { SakuraPetals } from './components/SakuraPetals';
import { SeasonTheme } from './components/SeasonTheme';
import { AnimatedBackground } from './components/AnimatedBackground';
import { GestureHandler } from './components/GestureHandler';
import { MusicMemory } from './components/MusicMemory';
import { InstallPrompt } from './components/InstallPrompt';

// Enhanced Page Transition
const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="h-full w-full" style={{background:"#0A000F"}}
    >
      {children}
    </motion.div>
  );
};

// Animated Routes Component
const PageFallback = () => (
  <div className="flex items-center justify-center h-full">
    <div className="flex gap-2">
      {[0,1,2].map(i => (
        <div key={i} className="w-2 h-2 rounded-full bg-[#FF6B9D] animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }} />
      ))}
    </div>
  </div>
);

const AnimatedRoutes: React.FC = () => {
  const location = useLocation();
  
  return (
    <Suspense fallback={<PageFallback />}>
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Home /></PageTransition>} />
        <Route path="/search" element={<PageTransition><Search /></PageTransition>} />
        <Route path="/library" element={<PageTransition><Library /></PageTransition>} />
        <Route path="/social" element={<PageTransition><Social /></PageTransition>} />
        <Route path="/album/:id" element={<PageTransition><AlbumDetails /></PageTransition>} />
        <Route path="/artist/:id" element={<PageTransition><ArtistDetails /></PageTransition>} />
        <Route path="/playlist/:id" element={<PageTransition><PlaylistDetails /></PageTransition>} />
        <Route path="/premium" element={<PageTransition><LoginPromo /></PageTransition>} />
        <Route path="/liked" element={<PageTransition><LikedSongs /></PageTransition>} />
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/signup" element={<PageTransition><Signup /></PageTransition>} />
        <Route path="/profile" element={<PageTransition><Profile /></PageTransition>} />
        <Route path="/artists/select" element={<PageTransition><ArtistSelection /></PageTransition>} />
        <Route path="/time-machine" element={<PageTransition><TimeMachine /></PageTransition>} />
        <Route path="/wrapped" element={<PageTransition><WrappedCard /></PageTransition>} />
        <Route path="/quiz" element={<PageTransition><MusicQuiz /></PageTransition>} />
        <Route path="/duel" element={<PageTransition><SongDuel /></PageTransition>} />
      </Routes>
    </AnimatePresence>
    </Suspense>
  );
};

// Layout wrapper to handle scroll behavior and structure
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { isOfflineMode, isFullScreen } = usePlayerStore();
  const { navPosition } = useUiStore();
  // Pages that don't need sidebar/player
  const isFullScreenPage = ['/premium', '/login', '/signup', '/artists/select'].includes(location.pathname);
  const mainRef = useRef<HTMLElement>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const currentNavPos = isMobile ? 'bottom' : navPosition;

  // Calculate padding based on nav position
  const getPaddingClasses = () => {
    if (isFullScreenPage) return '';
    if (currentNavPos === 'bottom') return 'pb-32 md:pb-24';
    if (currentNavPos === 'top') return 'pt-24';
    if (currentNavPos === 'left') return 'pl-24';
    if (currentNavPos === 'right') return 'pr-24';
    return '';
  };

  // Scroll to top on route change
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, behavior: 'smooth' }); // Smooth scroll to top
    }
  }, [location.pathname]);

  return (
    <div className="flex h-[100dvh] w-screen bg-black text-white overflow-hidden relative">
      <AudioController /> {/* Persistent Audio Logic */}
      
      {/* Global Offline Indicator */}
      <AnimatePresence>
          {isOfflineMode && !isFullScreenPage && (
              <motion.div 
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -50, opacity: 0 }}
                transition={{ type: "tween", duration: 0.3 }}
                className="absolute top-0 left-0 right-0 z-[100] bg-[#0A000F] flex items-center justify-center p-1 border-b border-white/10"
              >
                  <div className="flex items-center gap-2 text-xs font-bold text-[#FF6B9D]">
                      <WifiOff size={12} />
                      <span>Offline Mode</span>
                  </div>
              </motion.div>
          )}
      </AnimatePresence>
      
      <motion.main 
        layout
        ref={mainRef}
        className={`flex-1 relative overflow-y-auto no-scrollbar overscroll-none ${isFullScreenPage ? 'z-50 !m-0 !rounded-none' : ''} ${isFullScreen && !isFullScreenPage ? 'md:pr-[350px] lg:pr-[280px] xl:pr-[350px]' : ''} ${getPaddingClasses()}`}
      >
         {/* Main Content */}
        {children}
      </motion.main>

      {!isFullScreenPage && <DownloadProgress />}
      {!isFullScreenPage && <Player />}
      {!isFullScreenPage && <FloatingNav />}
    </div>
  );
};

const App: React.FC = () => {
  const { setOfflineMode, themeColor } = usePlayerStore();

  useEffect(() => {
    // Update Theme Color CSS Variables
    if (themeColor) {
      document.documentElement.style.setProperty('--theme-color', themeColor);
      
      // Convert hex to rgb for opacity support
      const hex = themeColor.replace('#', '');
      if (hex.length === 6) {
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        document.documentElement.style.setProperty('--theme-color-rgb', `${r} ${g} ${b}`);
      }
    }
  }, [themeColor]);

  useEffect(() => {
    const handleOnline = () => setOfflineMode(false);
    const handleOffline = () => setOfflineMode(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    setOfflineMode(!navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setOfflineMode]);

  return (
    <HashRouter>
      <SakuraPetals />
      <AnimatedBackground />
      <GestureHandler />
      <MusicMemory />
      <SeasonTheme />
      <InstallPrompt />
      <Layout>
        <AnimatedRoutes />
      </Layout>
    </HashRouter>
  );
};

export default App;