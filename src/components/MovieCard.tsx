import React, { useState, useEffect } from 'react';
import { Play, Star, Trash2, X, Info } from 'lucide-react';
import { MediaItem, ContinueWatchingItem, MediaType } from '../types';
import { getCertification } from '../services/tmdb';

interface MovieCardProps {
  item: MediaItem;
  continueWatchingItem?: ContinueWatchingItem;
  isEditMode?: boolean;
  onPlay: (item: MediaItem, season?: number, episode?: number) => void;
  onMoreInfo?: (item: MediaItem) => void;
  onDeleteContinueWatching?: (id: string) => void;
  onToggleComplete?: (id: string) => void;
}

export const MovieCard: React.FC<MovieCardProps> = ({
  item,
  continueWatchingItem,
  isEditMode = false,
  onPlay,
  onMoreInfo,
  onDeleteContinueWatching,
}) => {
  const [certification, setCertification] = useState<string>(item.certification || '');

  const mediaType: MediaType = item.media_type || (item.title ? 'movie' : 'tv');
  const title = item.title || item.name || 'Untitled';
  const posterUrl = item.poster_path
    ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
    : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=500&q=80';

  useEffect(() => {
    if (!certification) {
      getCertification(item.id, mediaType).then((cert) => {
        setCertification(cert);
      });
    }
  }, [item.id, mediaType, certification]);

  const ratingNumber = item.vote_average ? item.vote_average.toFixed(1) : '8.1';

  return (
    <div className="relative group flex-shrink-0 w-36 sm:w-48 md:w-56 rounded-lg overflow-hidden bg-zinc-900 border border-white/5 transition-all duration-300 transform hover:scale-105 hover:z-30 hover:shadow-2xl hover:shadow-red-950/50 cursor-pointer">
      {/* Poster Image Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-zinc-950">
        <img
          src={posterUrl}
          alt={title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* ALWAYS ON FRONT PG / R / TV-MA Badge + Rating Score */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none z-10">
          {/* Rating Certification Badge (PG-13, TV-MA, etc) */}
          <span className="bg-black/85 backdrop-blur-md text-white border border-white/40 text-[10px] sm:text-xs font-black px-1.5 py-0.5 rounded shadow-lg tracking-wide uppercase">
            {certification || (mediaType === 'movie' ? 'PG-13' : 'TV-MA')}
          </span>

          {/* TMDB Vote Average Score (hidden when edit mode delete button is present) */}
          {(!continueWatchingItem || !isEditMode) && (
            <span className="bg-black/85 backdrop-blur-md text-yellow-400 border border-yellow-500/30 text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded shadow-lg flex items-center gap-1">
              <Star className="w-3 h-3 fill-yellow-400 stroke-none" />
              {ratingNumber}
            </span>
          )}
        </div>

        {/* Delete button in Edit Mode on Top Right for Continue Watching */}
        {continueWatchingItem && isEditMode && onDeleteContinueWatching && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteContinueWatching(continueWatchingItem.id);
            }}
            className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-full shadow-2xl z-30 transition-transform transform hover:scale-110"
            title="Delete from Continue Watching"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Play Button Overlay on Hover */}
        <div
          onClick={() => onPlay(item, continueWatchingItem?.season, continueWatchingItem?.episode)}
          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 z-20"
        >
          <div className="w-12 h-12 rounded-full bg-[#E50914] text-white flex items-center justify-center transform hover:scale-110 shadow-xl transition-transform">
            <Play className="w-6 h-6 fill-white ml-0.5" />
          </div>
        </div>

        {/* Continue Watching Progress Bar */}
        {continueWatchingItem && (
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-zinc-800 z-10">
            <div
              className="h-full transition-all duration-300 bg-[#E50914]"
              style={{ width: `${continueWatchingItem.progressPercentage}%` }}
            />
          </div>
        )}
      </div>

      {/* Card Info Details */}
      <div className="p-2.5 sm:p-3 space-y-1.5">
        <div className="flex items-start justify-between gap-1">
          <h3 className="font-bold text-xs sm:text-sm text-white truncate max-w-[85%]" title={title}>
            {title}
          </h3>
          {onMoreInfo && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMoreInfo(item);
              }}
              className="text-gray-400 hover:text-white transition-colors p-0.5"
              title="More Info"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Secondary Info Line */}
        <div className="flex items-center justify-between text-[10px] sm:text-xs text-gray-400">
          <div className="flex items-center gap-1.5">
            <span className="uppercase font-extrabold text-[#E50914]">
              {continueWatchingItem
                ? continueWatchingItem.mediaType === 'tv'
                  ? `S${continueWatchingItem.season || 1} E${continueWatchingItem.episode || 1}`
                  : 'Movie'
                : mediaType.toUpperCase()}
            </span>
            {continueWatchingItem && (
              <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800/80 px-1 rounded">
                {continueWatchingItem.progressPercentage}%
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
