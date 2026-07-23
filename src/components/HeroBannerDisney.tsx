import React, { useState, useEffect } from 'react';
import { Play, ArrowRight, Check, Plus } from 'lucide-react';
import { MediaItem } from '../types';
import { getCertification } from '../services/tmdb';

interface HeroBannerDisneyProps {
  items: MediaItem[];
  onPlay: (item: MediaItem) => void;
  onMoreInfo: (item: MediaItem) => void;
  watchlist?: MediaItem[];
  onToggleWatchlist?: (item: MediaItem) => void;
}

export const HeroBannerDisney: React.FC<HeroBannerDisneyProps> = ({
  items,
  onPlay,
  onMoreInfo,
  watchlist = [],
  onToggleWatchlist,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [certification, setCertification] = useState('TVMA');

  const displayItems = items.slice(0, 6);
  const currentItem = displayItems[currentIndex] || displayItems[0];

  useEffect(() => {
    if (currentItem) {
      const mediaType = currentItem.media_type || (currentItem.title ? 'movie' : 'tv');
      getCertification(currentItem.id, mediaType).then((cert) => {
        setCertification(cert || (mediaType === 'tv' ? 'TVMA' : 'PG-13'));
      });
    }
  }, [currentItem]);

  // Auto-advance spotlight every 7 seconds
  useEffect(() => {
    if (displayItems.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayItems.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [displayItems.length]);

  if (!currentItem) return null;

  const title = currentItem.title || currentItem.name || 'LITTLE FIRES EVERYWHERE';
  const backdropUrl = currentItem.backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${currentItem.backdrop_path}`
    : `https://image.tmdb.org/t/p/w1280${currentItem.poster_path}`;

  const year = (currentItem.release_date || currentItem.first_air_date)?.split('-')[0] || '2020';

  return (
    <div className="relative w-full h-[580px] sm:h-[650px] md:h-[720px] overflow-hidden select-none bg-[#0a0a0c]">
      {/* Full Bleed Backdrop Image */}
      <div className="absolute inset-0">
        <img
          key={currentItem.id}
          src={backdropUrl}
          alt={title}
          className="w-full h-full object-cover object-center transition-all duration-1000 transform scale-100 animate-fade-in filter brightness-90"
        />

        {/* Ambient Dark Gradient Overlays matching Hulu cinematic glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0c] via-[#0a0a0c]/85 md:via-[#0a0a0c]/60 to-transparent w-full md:w-3/4" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#060608] via-transparent to-black/60" />
      </div>

      {/* Hero Left Content Area (Matching User UI Image) */}
      <div className="absolute bottom-16 sm:bottom-24 left-6 sm:left-12 md:left-16 max-w-xl md:max-w-2xl z-20 space-y-4 pr-4">
        {/* Eyebrow: START WATCHING */}
        <div className="text-zinc-300 font-extrabold text-xs sm:text-sm tracking-[0.25em] uppercase">
          START WATCHING
        </div>

        {/* Main Bold Uppercase Title */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight uppercase leading-none font-sans drop-shadow-xl">
          {title}
        </h1>

        {/* Description / Synopsis */}
        <p className="text-xs sm:text-sm md:text-base text-zinc-300 line-clamp-3 leading-relaxed font-medium max-w-xl drop-shadow">
          {currentItem.overview ||
            'Starring Reese Witherspoon and Kerry Washington, follows the intertwined fates of the picture-perfect Richardson family and an enigmatic mother and daughter who upend their lives.'}
        </p>

        {/* Metadata Line: TVMA · Drama · 2020 */}
        <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-zinc-300 tracking-wide">
          <span>{certification}</span>
          <span className="text-zinc-500">•</span>
          <span>Drama</span>
          <span className="text-zinc-500">•</span>
          <span>{year}</span>
        </div>

        {/* Action Buttons: ▶ PLAY  → DETAILS */}
        <div className="flex flex-wrap items-center gap-4 pt-2">
          <button
            onClick={() => onPlay(currentItem)}
            className="flex items-center justify-center gap-2.5 bg-white hover:bg-zinc-200 text-black font-extrabold text-xs sm:text-sm px-7 py-3 rounded-md transition-all duration-200 transform hover:scale-105 shadow-xl"
          >
            <Play className="w-4 h-4 fill-black ml-0.5" />
            <span className="tracking-wider uppercase">PLAY</span>
          </button>

          <button
            onClick={() => onMoreInfo(currentItem)}
            className="flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 text-white font-extrabold text-xs sm:text-sm px-6 py-3 rounded-md border border-white/20 transition-all duration-200 backdrop-blur-md transform hover:scale-105"
          >
            <ArrowRight className="w-4 h-4" />
            <span className="tracking-wider uppercase">DETAILS</span>
          </button>

          {onToggleWatchlist && (
            <button
              onClick={() => onToggleWatchlist(currentItem)}
              className={`flex items-center justify-center gap-2 font-extrabold text-xs sm:text-sm px-5 py-3 rounded-md border transition-all duration-200 backdrop-blur-md ${
                watchlist.some((i) => i.id === currentItem.id)
                  ? 'bg-white/20 border-white text-white'
                  : 'bg-black/40 hover:bg-black/60 border-white/20 text-white'
              }`}
            >
              {watchlist.some((i) => i.id === currentItem.id) ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span className="tracking-wider uppercase">SAVED</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 text-zinc-300" />
                  <span className="tracking-wider uppercase">MY STUFF</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Watermark Badge in Bottom Right Corner (FREEFLIX ORIGINALS - matching hulu ORIGINALS) */}
      <div className="absolute bottom-10 right-8 sm:right-12 z-20 flex flex-col items-end opacity-90 select-none">
        <span className="text-white font-black text-2xl sm:text-3xl tracking-tight uppercase font-sans drop-shadow-md">
          FREEFLIX
        </span>
        <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-[0.35em] text-zinc-300 -mt-1">
          ORIGINALS
        </span>
      </div>

      {/* Carousel Dots */}
      <div className="absolute bottom-4 left-6 sm:left-12 z-30 flex items-center gap-2">
        {displayItems.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`transition-all duration-300 rounded-full ${
              idx === currentIndex
                ? 'w-6 h-2 bg-white shadow-md'
                : 'w-2 h-2 bg-white/40 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
