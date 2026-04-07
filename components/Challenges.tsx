import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trophy, Zap, Shield, ChevronRight } from 'lucide-react';
import { usePlayerStore } from '../store/playerStore';

const DAILY_CHALLENGES = [
  { key: 'songs_today', label: 'Aaj 10 Songs Suno', target: 10, emoji: '🎵', reward: 'Daily Explorer 🗺️' },
  { key: 'liked_songs', label: '5 Songs Like Karo', target: 5, emoji: '❤️', reward: 'Heart Collector ❤️' },
  { key: 'total_songs', label: 'Lifetime 100 Songs', target: 100, emoji: '💯', reward: 'Century Club 💯' },
  { key: 'streak_days', label: '7 Din Streak', target: 7, emoji: '🔥', reward: 'Streak Master 🔥' },
];

export const ChallengesButton: React.FC = () => {
  const { challengeProgress, badges, listeningStreak, streakFreezes, useStreakFreeze } = usePlayerStore();
  const [open, setOpen] = useState(false);

  const progress = { ...challengeProgress, streak_days: listeningStreak };
  const totalCompleted = DAILY_CHALLENGES.filter(c => ((progress as any)[c.key] || 0) >= c.target).length;

  return (
    <>
      <motion.button whileTap={{ scale: 0.95 }} onClick={() => setOpen(true)}
        className="relative flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-[#F59E0B]/30 bg-[#F59E0B]/10 hover:bg-[#F59E0B]/20 transition-all">
        <Trophy size={16} className="text-[#F59E0B]" />
        <div className="flex flex-col items-start">
          <span className="text-white font-bold text-xs">Challenges</span>
          <span className="text-[#F59E0B] text-[10px]">{totalCompleted}/{DAILY_CHALLENGES.length} done</span>
        </div>
        {totalCompleted > 0 && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#F59E0B] rounded-full flex items-center justify-center">
            <span className="text-[8px] font-black text-black">{totalCompleted}</span>
          </div>
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[500] flex items-end justify-center" onClick={() => setOpen(false)}>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="relative w-full max-w-md rounded-t-3xl flex flex-col"
              style={{ background: 'linear-gradient(180deg,#1A1500,#0A000F)', maxHeight: '88vh' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-5 pb-3 shrink-0">
                <div className="flex items-center gap-2">
                  <Trophy size={18} className="text-[#F59E0B]" />
                  <span className="text-white font-bold">Challenges & Badges</span>
                </div>
                <button onClick={() => setOpen(false)} className="p-2 rounded-full hover:bg-white/10">
                  <X size={18} className="text-white/50" />
                </button>
              </div>

              <div className="overflow-y-auto no-scrollbar flex-1 px-5 pb-8 space-y-4">
                {/* Streak section */}
                <div className="rounded-2xl p-4 border border-[#F59E0B]/20 bg-[#F59E0B]/8">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🔥</span>
                      <div>
                        <p className="text-white font-bold text-sm">{listeningStreak} Din Streak</p>
                        <p className="text-white/40 text-xs">Roz sunne se streak badhti hai</p>
                      </div>
                    </div>
                    {streakFreezes > 0 && (
                      <motion.button whileTap={{ scale: 0.95 }} onClick={useStreakFreeze}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#06B6D4]/20 border border-[#06B6D4]/30 text-[#06B6D4] text-xs font-bold">
                        <Shield size={12} /> Freeze ({streakFreezes})
                      </motion.button>
                    )}
                  </div>
                  <div className="flex gap-1 mt-2">
                    {Array.from({ length: 7 }, (_, i) => (
                      <div key={i} className={`flex-1 h-2 rounded-full ${i < (listeningStreak % 7 || (listeningStreak > 0 ? 7 : 0)) ? 'bg-[#F59E0B]' : 'bg-[#2A0038]'}`} />
                    ))}
                  </div>
                </div>

                {/* Challenges */}
                <div className="space-y-3">
                  {DAILY_CHALLENGES.map(c => {
                    const val = (progress as any)[c.key] || 0;
                    const done = val >= c.target;
                    const pct = Math.min(100, (val / c.target) * 100);
                    const hasBadge = badges.includes(c.reward);
                    return (
                      <div key={c.key} className={`rounded-2xl p-4 border transition-all ${
                        done ? 'border-[#F59E0B]/40 bg-[#F59E0B]/10' : 'border-white/8 bg-[#130018]'
                      }`}>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">{c.emoji}</span>
                          <div className="flex-1">
                            <p className={`font-bold text-sm ${done ? 'text-[#F59E0B]' : 'text-white'}`}>{c.label}</p>
                            <p className="text-white/40 text-xs">Reward: {c.reward}</p>
                          </div>
                          {done ? (
                            <span className="text-[#F59E0B] text-xl">✓</span>
                          ) : (
                            <span className="text-white/30 text-xs font-bold">{val}/{c.target}</span>
                          )}
                        </div>
                        <div className="h-1.5 bg-[#2A0038] rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all"
                            style={{ width: `${pct}%`, background: done ? '#F59E0B' : 'linear-gradient(90deg,#FF6B9D,#F59E0B)' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Badges collection */}
                {badges.length > 0 && (
                  <div className="rounded-2xl p-4 border border-[#F59E0B]/15 bg-[#130018]">
                    <p className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                      <Zap size={14} className="text-[#F59E0B]" /> Tumhare Badges
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {badges.map((b, i) => (
                        <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i*0.05 }}
                          className="px-3 py-1.5 rounded-full bg-[#F59E0B]/15 border border-[#F59E0B]/30 text-[#F59E0B] text-xs font-bold">
                          {b}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {badges.length === 0 && (
                  <p className="text-center text-[#D4A0BA]/30 text-sm py-4">
                    Challenges complete karo — badges milenge! 🏅
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
