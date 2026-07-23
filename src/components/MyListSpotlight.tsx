import React, { useState, useEffect } from 'react';
import { Play, Info, Plus, Check, Star, Sparkles } from 'lucide-react';
import { MediaItem } from '../types';
import { getCertification } from '../services/tmdb';

interface MyListSpotlightProps {
  items: MediaItem[];
  onPlay: (item: MediaItem) => void;
  onMoreInfo: (item: MediaItem) => void;
}

export const MyListSpotlight: React.FC<MyListSpotlightProps> = ({ items, onPlay, onMoreInfo }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [certification, setCertification] = useState('TV-MA');
  const [isWatchlisted, setIsWatchlisted] = useState(false);

  const displayItems = items.slice(0, 7);
  const focusedItem = displayItems[selectedIndex] || displayItems[0];

  useEffect(() => {
    if (focusedItem) {
      const mediaType = focusedItem.media_type || (focusedItem.title ? 'movie' : 'tv');
      getCertification(focusedItem.id, mediaType).then(setCertification);
    }
  }, [focusedItem]);

  if (!focusedItem) return null;

  const title = focusedItem.title || focusedItem.name || 'Featured Title';
  const backdropUrl = focusedItem.backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${focusedItem.backdrop_path}`
    : `https://image.tmdb.org/t/p/w1280${focusedItem.poster_path}`;

  const year = (focusedItem.release_date || focusedItem.first_air_date)?.split('-')[0] || '2025';
  const isTv = focusedItem.media_type === 'tv' || !focusedItem.title;
  const typeTag = isTv ? 'Series' : 'Movie';

  return (
    <div className="pt-24 sm:pt-28 pb-8 px-4 sm:px-8 max-w-[1440px] mx-auto select-none space-y-6">
      {/* Featured Spotlight Showcase Box - Floating Frame */}
      <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.9)] bg-gradient-to-r from-zinc-950 via-zinc-900 to-black group">
        {/* Ambient Blur Background Glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-white/10 via-zinc-800/20 to-transparent blur-3xl opacity-60 pointer-events-none" />

        {/* Backdrop Image with Radial & Gradient Fades */}
        <div className="relative h-[380px] sm:h-[460px] md:h-[520px] w-full overflow-hidden">
          <img
            src={backdropUrl}
            alt={title}
            className="w-full h-full object-cover object-top sm:object-center transition-transform duration-700 group-hover:scale-105"
          />
          {/* Fades for gradient contrast */}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 sm:via-black/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

          {/* Hero Content Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 md:p-12 max-w-2xl space-y-4 z-20">
            {/* White Badge Indicator */}
            <div className="flex items-center gap-2">
              <span className="bg-white text-black text-[10px] sm:text-xs font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider shadow-md">
                {isTv ? 'SERIES SPOTLIGHT' : 'FEATURED MOVIE'}
              </span>
              <span className="text-xs font-bold text-zinc-300 bg-black/60 px-2 py-0.5 rounded-md border border-white/10 backdrop-blur-md">
                {certification}
              </span>
              <div className="flex items-center gap-1 text-white text-xs font-bold bg-black/60 px-2 py-0.5 rounded-md border border-white/10 backdrop-blur-md">
                <Star className="w-3.5 h-3.5 fill-white stroke-none" />
                <span>{focusedItem.vote_average?.toFixed(1) || '8.5'}</span>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight uppercase leading-none drop-shadow-xl font-sans">
              {title}
            </h1>

            {/* Tags & Year */}
            <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-zinc-300">
              <span className="text-white font-bold">{isTv ? 'Trending Series' : 'Blockbuster'}</span>
              <span className="text-zinc-600">•</span>
              <span>{year}</span>
              <span className="text-zinc-600">•</span>
              <span>{typeTag}</span>
            </div>

            {/* Synopsis */}
            <p className="text-xs sm:text-sm text-zinc-300/90 line-clamp-2 sm:line-clamp-3 leading-relaxed font-normal max-w-xl drop-shadow">
              {focusedItem.overview || 'Explore this acclaimed title now streaming in HD on FreeFlix.'}
            </p>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => onPlay(focusedItem)}
                className="flex items-center justify-center gap-2.5 bg-white hover:bg-zinc-200 text-black font-extrabold text-xs sm:text-sm px-6 py-3 rounded-2xl transition-all transform hover:scale-105 shadow-xl border border-white"
              >
                <Play className="w-4 h-4 fill-black text-black" />
                STREAM NOW
              </button>
              <button
                onClick={() => onMoreInfo(focusedItem)}
                className="flex items-center justify-center gap-2 bg-zinc-900/90 hover:bg-zinc-800 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-2xl border border-white/20 transition-all transform hover:scale-105 backdrop-blur-md shadow-lg"
              >
                <Info className="w-4 h-4 text-zinc-300" />
                DETAILS
              </button>
              <button
                onClick={() => setIsWatchlisted(!isWatchlisted)}
                className="p-3 rounded-2xl bg-zinc-900/90 border border-white/20 text-white hover:border-white transition-all backdrop-blur-md transform hover:scale-105"
                title="Watchlist"
              >
                {isWatchlisted ? <Check className="w-4 h-4 text-white" /> : <Plus className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Horizontal Carousel Thumbnails below Spotlight */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-black uppercase text-zinc-400 tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-white" />
          <span>Spotlight Selection</span>
        </div>
        <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto no-scrollbar py-2">
          {displayItems.map((item, index) => {
            const posterUrl = item.poster_path
              ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
              : `https://image.tmdb.org/t/p/w500${item.backdrop_path}`;
            const isSelected = index === selectedIndex;
            const cardTitle = item.title || item.name || 'Title';

            return (
              <div
                key={item.id}
                onClick={() => setSelectedIndex(index)}
                className={`relative flex-shrink-0 w-28 sm:w-36 md:w-40 aspect-[16/10] rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 bg-zinc-900 border ${
                  isSelected
                    ? 'border-2 border-white ring-2 ring-white/60 scale-105 shadow-[0_0_20px_rgba(255,255,255,0.3)] z-20'
                    : 'border-white/10 opacity-70 hover:opacity-100 hover:scale-102 hover:border-white/30'
                }`}
              >
                <img
                  src={posterUrl}
                  alt={cardTitle}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                <p className="absolute bottom-1.5 left-2 right-2 text-[10px] font-bold text-white truncate">
                  {cardTitle}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
