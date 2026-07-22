import React, { useState, useEffect } from 'react';
import { Play, Info, Plus, Check, Star } from 'lucide-react';
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
  const [isMyList, setIsMyList] = useState(true);

  const displayItems = items.slice(0, 8);
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

  const year = (focusedItem.release_date || focusedItem.first_air_date)?.split('-')[0] || '2024';
  const isTv = focusedItem.media_type === 'tv' || !focusedItem.title;
  const typeTag = isTv ? 'Series' : 'Movie';

  return (
    <div className="pt-20 sm:pt-24 pb-6 px-4 sm:px-8 max-w-[1440px] mx-auto select-none">
      {/* Main Grid: Left Focused Card + Right Poster Carousel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Focused Card Column */}
        <div className="lg:col-span-5 space-y-3">
          {/* Main Focused Landscape Image Box with crisp white border outline */}
          <div
            onClick={() => onPlay(focusedItem)}
            className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden border-2 border-white shadow-2xl shadow-black/80 bg-zinc-900 group cursor-pointer transition-transform duration-300 transform hover:scale-[1.01]"
          >
            <img
              src={backdropUrl}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

            {/* Red N Series / Film Badge + Title inside image */}
            <div className="absolute bottom-4 left-4 right-4 space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-black text-[#E50914] uppercase tracking-widest">
                <span className="bg-[#E50914] text-white px-1 py-0.2 rounded text-[9px] font-black">N</span>
                <span>{isTv ? 'SERIES' : 'FILM'}</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight drop-shadow-md uppercase leading-none">
                {title}
              </h3>
            </div>

            {/* Hover Play Icon Overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-[#E50914] text-white flex items-center justify-center shadow-2xl transform scale-90 group-hover:scale-100 transition-transform">
                <Play className="w-7 h-7 fill-white ml-1" />
              </div>
            </div>
          </div>

          {/* Under-Card Metadata & Synopsis */}
          <div className="space-y-2 pt-1 text-zinc-300">
            {/* Sub-line info tags */}
            <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-zinc-300">
              <span className="text-white font-bold">{isTv ? 'TV Dramas' : 'Action & Movies'}</span>
              <span className="text-zinc-500">•</span>
              <span>{year}</span>
              <span className="text-zinc-500">•</span>
              <span>{typeTag}</span>
              <span className="text-zinc-500">•</span>
              <span className="border border-zinc-600 px-1 py-0.2 rounded text-[10px] font-bold text-zinc-200">
                {certification}
              </span>
              <div className="ml-auto flex items-center gap-1 text-yellow-400 text-xs font-bold bg-zinc-900/80 px-2 py-0.5 rounded border border-white/10">
                <Star className="w-3 h-3 fill-yellow-400 stroke-none" />
                <span>{focusedItem.vote_average?.toFixed(1) || '8.2'}</span>
              </div>
            </div>

            {/* Overview snippet */}
            <p className="text-xs sm:text-sm text-zinc-400 line-clamp-3 leading-relaxed font-normal">
              {focusedItem.overview || 'Inspired by real events, this gripping dramatization delivers thrilling storytelling and unforgettable performances.'}
            </p>

            {/* Action buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => onPlay(focusedItem)}
                className="flex items-center justify-center gap-2 bg-white hover:bg-zinc-200 text-black font-extrabold text-xs sm:text-sm px-5 py-2 rounded-lg transition-all transform hover:scale-105 shadow-lg"
              >
                <Play className="w-4 h-4 fill-black" />
                Play
              </button>
              <button
                onClick={() => onMoreInfo(focusedItem)}
                className="flex items-center justify-center gap-2 bg-zinc-800/80 hover:bg-zinc-700 text-white font-bold text-xs sm:text-sm px-4 py-2 rounded-lg border border-white/10 transition-all transform hover:scale-105"
              >
                <Info className="w-4 h-4" />
                Details
              </button>
              <button
                onClick={() => setIsMyList(!isMyList)}
                className="p-2 rounded-lg bg-zinc-800/80 border border-white/10 text-white hover:border-white transition-colors"
                title="Watchlist"
              >
                {isMyList ? <Check className="w-4 h-4 text-green-400" /> : <Plus className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Right Poster Row Column */}
        <div className="lg:col-span-7">
          <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto no-scrollbar py-1">
            {displayItems.map((item, index) => {
              const posterUrl = item.poster_path
                ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                : `https://image.tmdb.org/t/p/w500${item.backdrop_path}`;
              const isSelected = index === selectedIndex;
              const cardTitle = item.title || item.name || 'Title';

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedIndex(index);
                  }}
                  className={`relative flex-shrink-0 w-32 sm:w-40 md:w-44 aspect-[2/3] rounded-xl overflow-hidden cursor-pointer transition-all duration-300 bg-zinc-900 border ${
                    isSelected
                      ? 'border-2 border-white scale-105 shadow-xl shadow-black/80 z-20'
                      : 'border-white/10 opacity-80 hover:opacity-100 hover:scale-102 hover:border-white/40'
                  }`}
                >
                  {/* Poster Image */}
                  <img
                    src={posterUrl}
                    alt={cardTitle}
                    className="w-full h-full object-cover"
                  />

                  {/* Red N logo top-left corner */}
                  <div className="absolute top-2 left-2 z-10">
                    <span className="text-[#E50914] font-black text-sm drop-shadow-md">N</span>
                  </div>

                  {/* Optional Top 10 Ranking Badge on select cards */}
                  {index === 1 && (
                    <div className="absolute bottom-2 left-2 right-2 z-10 bg-black/80 backdrop-blur-md border border-red-500/30 rounded px-1.5 py-0.5 text-[9px] font-bold text-white flex items-center justify-center gap-1 shadow-md">
                      <span className="text-[#E50914] font-black">TOP 10</span>
                      <span className="truncate">#1 in TV Shows</span>
                    </div>
                  )}

                  {/* Card Title Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity p-2 flex items-end">
                    <span className="text-white text-xs font-bold line-clamp-2">{cardTitle}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
