import React, { useState } from 'react';
import { Clock, Edit3, Trash2, CheckCircle, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { ContinueWatchingItem, MediaItem } from '../types';
import { MovieCard } from './MovieCard';

interface ContinueWatchingRowProps {
  items: ContinueWatchingItem[];
  onPlay: (item: MediaItem, season?: number, episode?: number) => void;
  onDeleteItem: (id: string) => void;
  onToggleComplete: (id: string) => void;
  onClearAll: () => void;
}

export const ContinueWatchingRow: React.FC<ContinueWatchingRowProps> = ({
  items,
  onPlay,
  onDeleteItem,
  onToggleComplete,
  onClearAll,
}) => {
  const [isEditMode, setIsEditMode] = useState(false);

  if (!items || items.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="space-y-3 my-8 px-4 sm:px-8 max-w-7xl mx-auto bg-gradient-to-r from-red-950/20 via-zinc-900/40 to-transparent p-4 sm:p-6 rounded-2xl border border-red-900/30"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-2 bg-[#E50914] text-white rounded-lg shadow-lg">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-wide">
              Continue Watching
            </h2>
            <p className="text-xs text-gray-400">
              Pick up right where you left off
            </p>
          </div>
        </div>

        {/* Edit & Clear Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs sm:text-sm transition-all border ${
              isEditMode
                ? 'bg-red-600 text-white border-red-500 shadow-lg shadow-red-900/50'
                : 'bg-zinc-800 text-gray-300 border-zinc-700 hover:text-white hover:border-white'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            {isEditMode ? 'Done Editing' : 'Edit List'}
          </button>

          {isEditMode && (
            <button
              onClick={onClearAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs sm:text-sm bg-red-950/80 text-red-300 border border-red-800/60 hover:bg-red-900 hover:text-white transition-all"
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Row of Continue Watching cards */}
      <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-3 px-1">
        {items.map((cw) => {
          const mediaItem: MediaItem = {
            id: cw.tmdbId,
            title: cw.title,
            name: cw.title,
            poster_path: cw.posterPath,
            backdrop_path: cw.backdropPath,
            media_type: cw.mediaType,
            vote_average: cw.voteAverage || 8.5,
            overview: `Continue season ${cw.season || 1} episode ${cw.episode || 1}`,
            certification: cw.certification,
          };

          return (
            <MovieCard
              key={cw.id}
              item={mediaItem}
              continueWatchingItem={cw}
              isEditMode={isEditMode}
              onPlay={(item, s, e) => onPlay(item, s || cw.season || 1, e || cw.episode || 1)}
              onDeleteContinueWatching={onDeleteItem}
              onToggleComplete={onToggleComplete}
            />
          );
        })}
      </div>
    </motion.div>
  );
};
