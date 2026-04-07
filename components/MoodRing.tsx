import React, { useEffect, useState } from 'react';
import { usePlayerStore } from '../store/playerStore';

// Assign color and vibe to songs based on title/genre keywords
function getSongMood(song: any): { color: string; label: string; emoji: string } {
  const text = `${song?.name || ''} ${song?.genre || ''} ${song?.album?.name || ''}`.toLowerCase();
  if (/sad|dard|taklif|rona|alone|heartbreak|empty|miss|cry/.test(text))
    return { color: '#6366F1', label: 'Melancholy', emoji: '💜' };
  if (/love|pyaar|ishq|dil|romance|romantic|baby|darling/.test(text))
    return { color: '#FF6B9D', label: 'Romantic', emoji: '💕' };
  if (/happy|khushi|party|dance|celebrate|fun|joy/.test(text))
    return { color: '#F59E0B', label: 'Joyful', emoji: '✨' };
  if (/angry|rage|rock|metal|intense|fire|beast/.test(text))
    return { color: '#EF4444', label: 'Intense', emoji: '🔥' };
  if (/chill|lofi|relax|peace|calm|sleep|night/.test(text))
    return { color: '#06B6D4', label: 'Chill', emoji: '😌' };
  if (/workout|gym|run|energy|power|strong/.test(text))
    return { color: '#10B981', label: 'Energetic', emoji: '💪' };
  // Default by language
  if (/hindi|bollywood/.test(text))
    return { color: '#FF6B9D', label: 'Filmy', emoji: '🎬' };
  return { color: '#A855F7', label: 'Vibes', emoji: '🎵' };
}

export const MoodRing: React.FC = () => {
  const { currentSong, isPlaying } = usePlayerStore();
  const [mood, setMood] = useState({ color: '#FF6B9D', label: 'Ready', emoji: '🌸' });

  useEffect(() => {
    if (currentSong) setMood(getSongMood(currentSong));
  }, [currentSong?.id]);

  if (!currentSong) return null;

  return (
    <div className="flex items-center gap-2" title={`Mood: ${mood.label}`}>
      <div className="relative w-5 h-5">
        <div className="absolute inset-0 rounded-full opacity-60 animate-pulse"
          style={{ background: mood.color, filter: 'blur(4px)' }} />
        <div className="absolute inset-0.5 rounded-full border-2"
          style={{ borderColor: mood.color, background: `${mood.color}30` }} />
      </div>
      {isPlaying && (
        <span className="text-[10px] font-bold" style={{ color: mood.color }}>
          {mood.emoji} {mood.label}
        </span>
      )}
    </div>
  );
};
