import React, { useEffect } from 'react';
import { usePlayerStore } from '../store/playerStore';

const SEASON_THEMES = {
  spring:    { primary: '#FF6B9D', bg: '#0A000F', particle: '🌸', name: 'Cherry Blossom' },
  summer:    { primary: '#F59E0B', bg: '#0A0500', particle: '☀️', name: 'Summer Sun' },
  monsoon:   { primary: '#06B6D4', bg: '#000A10', particle: '🌧️', name: 'Monsoon Blues' },
  autumn:    { primary: '#F97316', bg: '#0A0500', particle: '🍂', name: 'Autumn Leaves' },
  winter:    { primary: '#A5B4FC', bg: '#00020A', particle: '❄️', name: 'Winter Frost' },
  christmas: { primary: '#EF4444', bg: '#050000', particle: '🎄', name: 'Christmas Magic' },
};

export const SeasonTheme: React.FC = () => {
  const { currentSeason, detectSeason, appTheme } = usePlayerStore();

  useEffect(() => {
    detectSeason();
  }, []);

  // Only override if user hasn't manually set a non-sakura theme
  const theme = SEASON_THEMES[currentSeason];

  useEffect(() => {
    if (appTheme !== 'sakura') return; // User has chosen a custom theme
    // Apply seasonal accents subtly (only tint, not full override)
    const root = document.documentElement;
    // Just update CSS variables for ambient effects
    root.style.setProperty('--season-color', theme.primary);
    root.style.setProperty('--season-particle', theme.particle);
  }, [currentSeason, appTheme, theme]);

  return null; // This is a silent side-effect component
};

// Export season info for use in other components
export const useSeasonInfo = () => {
  const { currentSeason } = usePlayerStore();
  return SEASON_THEMES[currentSeason] || SEASON_THEMES.spring;
};
