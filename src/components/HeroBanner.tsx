import React, { useState, useEffect } from 'react';
import { Play, Info, Star, Volume2, VolumeX, Plus, Check } from 'lucide-react';
import { MediaItem } from '../types';
import { getCertification } from '../services/tmdb';

interface HeroBannerProps {
  item: MediaItem | null;
  onPlay: (item: MediaItem) => void;
  onMoreInfo: (item: MediaItem) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ item, onPlay, onMoreInfo }) => {
  const [rating, setRating] = useState<string>('PG-13');
  const [isMuted, setIsMuted] = useState(true);
  const [isMyList, setIsMyList] = useState(false);

  useEffect(() => {
    if (item) {
      const mediaType = item.media_type || (item.title ? 'movie' : 'tv');
      getCertification(item.id, mediaType).then(setRating);
    }
  }, [item]);

  if (!item) {
    return (
      <div className="w-full h-[65vh] sm:h-[80vh] bg-gradient-to-r from-black via-[#181818] to-black animate-pulse flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const title = item.title || item.name || 'Featured Title';
  const backdropUrl = item.backdrop_path
    ? `https://image.tmdb.org/t/p/original${item.backdrop_path}`
    : `https://image.tmdb.org/t/p/original${item.poster_path}`;

  return (
    <div className="relative w-full h-[70vh] sm:h-[85vh] text-white overflow-hidden select-none">
      {/* Backdrop Image with gradient overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000 transform scale-105"
        style={{ backgroundImage: `url(${backdropUrl})` }}
      >
        {/* Left & Bottom darkness gradients for readable text */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-transparent opacity-80" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-16 sm:pb-24">
        <div className="max-w-2xl space-y-3 sm:space-y-4">
          {/* Badge & Rating overlay */}
          <div className="flex items-center gap-3">
            <span className="bg-[#E50914] text-white text-[10px] sm:text-xs font-black uppercase px-2 py-0.5 rounded tracking-wider shadow-md">
              N FILM
            </span>
            {/* PG Rating badge */}
            <span className="border border-white/60 bg-black/50 text-white font-bold text-xs sm:text-sm px-2 py-0.5 rounded backdrop-blur-sm shadow-md">
              {rating}
            </span>
            <div className="flex items-center gap-1 text-yellow-400 text-xs font-semibold bg-black/40 px-2 py-0.5 rounded border border-white/10">
              <Star className="w-3.5 h-3.5 fill-yellow-400" />
              <span>{item.vote_average?.toFixed(1) || '8.5'}</span>
            </div>
            {item.release_date || item.first_air_date ? (
              <span className="text-gray-300 text-xs font-medium">
                {(item.release_date || item.first_air_date)?.split('-')[0]}
              </span>
            ) : null}
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight drop-shadow-2xl text-white font-sans leading-none">
            {title}
          </h1>

          {/* Overview text */}
          <p className="text-gray-200 text-xs sm:text-sm md:text-base line-clamp-3 leading-relaxed drop-shadow-md max-w-xl font-normal">
            {item.overview}
          </p>

          {/* Action buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => onPlay(item)}
              className="flex items-center justify-center gap-2 bg-white hover:bg-white/80 text-black font-extrabold text-sm sm:text-base px-6 sm:px-8 py-2.5 sm:py-3 rounded transition-all transform hover:scale-105 active:scale-95 shadow-xl"
            >
              <Play className="w-5 h-5 fill-black" />
              Play
            </button>

            <button
              onClick={() => onMoreInfo(item)}
              className="flex items-center justify-center gap-2 bg-gray-500/40 hover:bg-gray-500/60 text-white font-bold text-sm sm:text-base px-5 sm:px-7 py-2.5 sm:py-3 rounded backdrop-blur-md transition-all transform hover:scale-105 active:scale-95 border border-white/20"
            >
              <Info className="w-5 h-5" />
              More Info
            </button>

            <button
              onClick={() => setIsMyList(!isMyList)}
              className="p-3 rounded-full bg-black/40 border border-white/30 text-white hover:border-white transition-colors backdrop-blur-md"
              title="Add to My List"
            >
              {isMyList ? <Check className="w-5 h-5 text-green-400" /> : <Plus className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Right-aligned Mute & Rating notice bar */}
      <div className="absolute right-0 bottom-24 z-20 flex items-center gap-3">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="p-2.5 rounded-full border border-white/40 bg-black/50 text-white hover:border-white transition-colors backdrop-blur-md mr-4 sm:mr-8"
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};
