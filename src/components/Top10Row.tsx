import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Play, Star, Plus, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { MediaItem } from '../types';

interface Top10RowProps {
  title?: string;
  items: MediaItem[];
  onPlay: (item: MediaItem) => void;
  onMoreInfo: (item: MediaItem) => void;
  watchlist?: MediaItem[];
  onToggleWatchlist?: (item: MediaItem) => void;
}

export const Top10Row: React.FC<Top10RowProps> = ({
  title = "Top 10",
  items,
  onPlay,
  onMoreInfo,
  watchlist = [],
  onToggleWatchlist,
}) => {
  const rowRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const scrollAmount = direction === 'left' ? -600 : 600;
      rowRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const top10List = items.slice(0, 10);

  if (top10List.length === 0) return null;

  return (
    <div className="w-full my-8 px-4 sm:px-8 max-w-7xl mx-auto group/top10 select-none">
      <div className="flex items-center gap-3 mb-4">
        <span className="w-2 h-7 bg-white rounded-full inline-block shadow-[0_0_12px_rgba(255,255,255,0.9)]" />
        <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight uppercase font-sans">
          {title}
        </h2>
      </div>

      <div className="relative rounded-3xl overflow-hidden">
        {/* Scroll Left Button */}
        <button
          onClick={() => handleScroll('left')}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-30 bg-white hover:bg-zinc-200 text-black p-3 rounded-full opacity-0 group-hover/top10:opacity-100 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.4)] transform hover:scale-110 -translate-x-4 group-hover/top10:translate-x-0"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Scrollable Container */}
        <div
          ref={rowRef}
          className="flex items-center gap-6 sm:gap-10 overflow-x-auto no-scrollbar py-6 px-4 scroll-smooth"
        >
          {top10List.map((item, index) => {
            const rank = index + 1;
            const itemTitle = item.title || item.name || 'Untitled';
            const posterUrl = item.poster_path
              ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
              : item.backdrop_path
              ? `https://image.tmdb.org/t/p/w500${item.backdrop_path}`
              : '';

            const isSaved = watchlist.some((w) => w.id === item.id);

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="flex-shrink-0 relative flex items-end group/card cursor-pointer"
                onClick={() => onPlay(item)}
              >
                {/* Giant Styled Rank Number */}
                <div className="relative -mr-8 sm:-mr-12 z-0 pointer-events-none select-none flex items-end">
                  <span
                    className="font-black text-[110px] sm:text-[160px] md:text-[200px] leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-300 to-zinc-700 font-sans stroke-text drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]"
                    style={{
                      WebkitTextStroke: '3px rgba(255,255,255,0.9)',
                      textShadow: '0 0 25px rgba(255,255,255,0.2)',
                    }}
                  >
                    {rank}
                  </span>
                </div>

                {/* Poster Card */}
                <div className="relative z-10 w-36 sm:w-48 md:w-56 aspect-[2/3] rounded-2xl sm:rounded-3xl overflow-hidden bg-zinc-900 border border-white/20 shadow-2xl transition-all duration-300 transform group-hover/card:scale-105 group-hover/card:-translate-y-2 group-hover/card:shadow-[0_20px_40px_rgba(255,255,255,0.2)] group-hover/card:border-white">
                  {posterUrl ? (
                    <img
                      src={posterUrl}
                      alt={itemTitle}
                      className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center p-4 bg-zinc-900 text-center font-bold text-white text-sm">
                      {itemTitle}
                    </div>
                  )}

                  {/* Dark Vignette and Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover/card:opacity-90 transition-opacity duration-300" />

                  {/* Play Button Icon on Hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-all duration-300 transform scale-75 group-hover/card:scale-100">
                    <div className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center shadow-2xl">
                      <Play className="w-7 h-7 fill-black ml-1" />
                    </div>
                  </div>

                  {/* Top Right Save Button */}
                  {onToggleWatchlist && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleWatchlist(item);
                      }}
                      className="absolute top-3 right-3 z-20 p-2 rounded-full bg-black/60 hover:bg-white hover:text-black text-white border border-white/30 backdrop-blur-md transition-all duration-200"
                      title={isSaved ? "Remove from My Stuff" : "Save to My Stuff"}
                    >
                      {isSaved ? <Check className="w-4 h-4 text-emerald-400" /> : <Plus className="w-4 h-4" />}
                    </button>
                  )}

                  {/* Bottom Information */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 text-white">
                    <p className="font-extrabold text-xs sm:text-sm line-clamp-1 group-hover/card:text-white transition-colors">
                      {itemTitle}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[10px] sm:text-xs font-bold text-zinc-300">
                      <span className="flex items-center text-amber-400">
                        <Star className="w-3 h-3 fill-amber-400 mr-0.5" />
                        {item.vote_average ? item.vote_average.toFixed(1) : '8.5'}
                      </span>
                      <span>•</span>
                      <span>{item.media_type === 'tv' ? 'Series' : 'Movie'}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Scroll Right Button */}
        <button
          onClick={() => handleScroll('right')}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-30 bg-white hover:bg-zinc-200 text-black p-3 rounded-full opacity-0 group-hover/top10:opacity-100 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.4)] transform hover:scale-110 translate-x-4 group-hover/top10:translate-x-0"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};
