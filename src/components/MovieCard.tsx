import React, { useState, useEffect } from 'react';
import { Play, Star, Info, Film, Tv } from 'lucide-react';
import { MediaItem, MediaType } from '../types';
import { getCertification } from '../services/tmdb';

interface MovieCardProps {
  item: MediaItem;
  fullWidth?: boolean;
  onPlay: (item: MediaItem) => void;
  onMoreInfo?: (item: MediaItem) => void;
}

export const MovieCard: React.FC<MovieCardProps> = ({
  item,
  fullWidth = false,
  onPlay,
  onMoreInfo,
}) => {
  const [certification, setCertification] = useState<string>(item.certification || '');
  const [imgError, setImgError] = useState<boolean>(false);
  const [triedBackdrop, setTriedBackdrop] = useState<boolean>(false);

  const mediaType: MediaType = item.media_type || (item.title ? 'movie' : 'tv');
  const title = item.title || item.name || 'Untitled';
  const releaseYear = (item.release_date || item.first_air_date || '').split('-')[0];

  // Determine current image URL
  const getPosterUrl = () => {
    if (imgError) return null;
    if (!triedBackdrop && item.poster_path) {
      return `https://image.tmdb.org/t/p/w500${item.poster_path}`;
    }
    if (item.backdrop_path) {
      return `https://image.tmdb.org/t/p/w500${item.backdrop_path}`;
    }
    if (item.poster_path) {
      return `https://image.tmdb.org/t/p/w500${item.poster_path}`;
    }
    return null;
  };

  const currentPosterUrl = getPosterUrl();

  const handleImgError = () => {
    if (!triedBackdrop && item.backdrop_path && item.poster_path) {
      setTriedBackdrop(true);
    } else {
      setImgError(true);
    }
  };

  useEffect(() => {
    if (!certification) {
      getCertification(item.id, mediaType).then((cert) => {
        setCertification(cert);
      });
    }
  }, [item.id, mediaType, certification]);

  const ratingNumber = item.vote_average ? item.vote_average.toFixed(1) : '8.1';

  return (
    <div
      onClick={() => onPlay(item)}
      className={`relative group ${
        fullWidth ? 'w-full' : 'w-36 sm:w-48 md:w-52 flex-shrink-0'
      } rounded-2xl overflow-hidden bg-gradient-to-b from-zinc-900/90 via-zinc-900/60 to-black border border-white/10 hover:border-red-500/80 transition-all duration-300 ease-out transform hover:scale-[1.04] hover:-translate-y-2 hover:z-30 hover:shadow-[0_12px_32px_rgba(229,9,20,0.45)] cursor-pointer`}
    >
      {/* Poster Image Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-zinc-950">
        {currentPosterUrl ? (
          <img
            src={currentPosterUrl}
            alt={title}
            loading="lazy"
            onError={handleImgError}
            className="w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-110"
          />
        ) : (
          /* Styled Fallback Poster Card */
          <div className="w-full h-full bg-gradient-to-br from-zinc-900 via-red-950/40 to-zinc-950 p-4 flex flex-col justify-between relative overflow-hidden border border-white/5">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(229,9,20,0.15),transparent_70%)]" />
            <div className="relative z-10 pt-8">
              {mediaType === 'movie' ? (
                <Film className="w-8 h-8 text-red-500/80 mb-2" />
              ) : (
                <Tv className="w-8 h-8 text-red-500/80 mb-2" />
              )}
              <p className="font-black text-sm text-white line-clamp-3 leading-snug drop-shadow-md">
                {title}
              </p>
              {releaseYear && (
                <span className="inline-block mt-2 text-[10px] font-bold text-zinc-400 bg-black/60 px-2 py-0.5 rounded border border-white/10">
                  {releaseYear}
                </span>
              )}
            </div>
            <div className="relative z-10 flex items-center justify-between text-[10px] text-zinc-400 border-t border-white/10 pt-2">
              <span className="uppercase font-bold text-red-500">{mediaType}</span>
              <span className="flex items-center gap-0.5 text-yellow-400">
                <Star className="w-3 h-3 fill-yellow-400" />
                {ratingNumber}
              </span>
            </div>
          </div>
        )}

        {/* ALWAYS ON FRONT Rating & Badge */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none z-10">
          <span className="bg-black/80 backdrop-blur-md text-white border border-white/30 text-[10px] sm:text-xs font-black px-1.5 py-0.5 rounded-md shadow-lg tracking-wide uppercase">
            {certification || (mediaType === 'movie' ? 'PG-13' : 'TV-MA')}
          </span>

          <span className="bg-black/80 backdrop-blur-md text-yellow-400 border border-yellow-500/30 text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded-md shadow-lg flex items-center gap-1">
            <Star className="w-3 h-3 fill-yellow-400 stroke-none" />
            {ratingNumber}
          </span>
        </div>

        {/* Play Button Overlay on Hover */}
        <div
          onClick={() => onPlay(item)}
          className="absolute inset-0 bg-black/50 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 z-20"
        >
          <div className="w-12 h-12 rounded-full bg-[#E50914] text-white flex items-center justify-center transform hover:scale-110 shadow-2xl transition-transform border border-white/20">
            <Play className="w-6 h-6 fill-white ml-0.5" />
          </div>
        </div>
      </div>

      {/* Card Info Details */}
      <div className="p-3 space-y-1">
        <div className="flex items-start justify-between gap-1">
          <h3 className="font-extrabold text-xs sm:text-sm text-white truncate max-w-[85%] group-hover:text-red-400 transition-colors" title={title}>
            {title}
          </h3>
          {onMoreInfo && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMoreInfo(item);
              }}
              className="text-zinc-400 hover:text-white transition-colors p-0.5"
              title="More Info"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Secondary Info Line */}
        <div className="flex items-center justify-between text-[10px] sm:text-xs text-zinc-400 font-medium">
          <div className="flex items-center gap-1.5">
            <span className="uppercase font-extrabold text-[#E50914]">
              {mediaType.toUpperCase()}
            </span>
            {releaseYear && <span className="text-zinc-500">• {releaseYear}</span>}
          </div>
        </div>
      </div>
    </div>
  );
};
