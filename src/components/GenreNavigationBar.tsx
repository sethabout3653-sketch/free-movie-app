import React from 'react';
import { motion } from 'motion/react';
import { Rocket, Skull, Smile, Film, Zap, Theater, Sparkles, Heart, Eye, Compass, Flame } from 'lucide-react';

export interface GenreOption {
  id: number | null;
  name: string;
  movieGenreId?: number;
  tvGenreId?: number;
  icon: React.ReactNode;
}

export const POPULAR_GENRES: GenreOption[] = [
  {
    id: null,
    name: 'All Genres',
    icon: <Compass className="w-4 h-4 text-zinc-300" />,
  },
  {
    id: 878,
    name: 'Sci-Fi',
    movieGenreId: 878,
    tvGenreId: 10765,
    icon: <Rocket className="w-4 h-4 text-zinc-300" />,
  },
  {
    id: 27,
    name: 'Horror',
    movieGenreId: 27,
    tvGenreId: 9648,
    icon: <Skull className="w-4 h-4 text-zinc-300" />,
  },
  {
    id: 35,
    name: 'Comedy',
    movieGenreId: 35,
    tvGenreId: 35,
    icon: <Smile className="w-4 h-4 text-zinc-300" />,
  },
  {
    id: 99,
    name: 'Documentary',
    movieGenreId: 99,
    tvGenreId: 99,
    icon: <Film className="w-4 h-4 text-zinc-300" />,
  },
  {
    id: 28,
    name: 'Action',
    movieGenreId: 28,
    tvGenreId: 10759,
    icon: <Zap className="w-4 h-4 text-zinc-300" />,
  },
  {
    id: 18,
    name: 'Drama',
    movieGenreId: 18,
    tvGenreId: 18,
    icon: <Theater className="w-4 h-4 text-zinc-300" />,
  },
  {
    id: 16,
    name: 'Animation',
    movieGenreId: 16,
    tvGenreId: 16,
    icon: <Sparkles className="w-4 h-4 text-zinc-300" />,
  },
  {
    id: 10749,
    name: 'Romance',
    movieGenreId: 10749,
    tvGenreId: 10749,
    icon: <Heart className="w-4 h-4 text-zinc-300" />,
  },
  {
    id: 53,
    name: 'Thriller',
    movieGenreId: 53,
    tvGenreId: 9648,
    icon: <Eye className="w-4 h-4 text-zinc-300" />,
  },
];

interface GenreNavigationBarProps {
  selectedGenreId: number | null;
  onSelectGenre: (genre: GenreOption) => void;
}

export const GenreNavigationBar: React.FC<GenreNavigationBarProps> = ({
  selectedGenreId,
  onSelectGenre,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="my-4 px-4 sm:px-8 max-w-7xl mx-auto"
    >
      <div className="flex items-center gap-2 mb-2">
        <Flame className="w-4 h-4 text-white" />
        <h3 className="text-xs uppercase font-bold tracking-wider text-gray-400">
          Filter by Genre
        </h3>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto scrollbar-none py-2 px-1 -mx-1">
        {POPULAR_GENRES.map((genre) => {
          const isSelected = selectedGenreId === genre.id;
          return (
            <button
              key={genre.id ?? 'all'}
              onClick={() => onSelectGenre(genre)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 border cursor-pointer select-none ${
                isSelected
                  ? 'bg-white text-black border-white shadow-lg shadow-white/10 scale-105 font-extrabold'
                  : 'bg-zinc-900/80 text-gray-300 border-zinc-800 hover:bg-zinc-800 hover:text-white hover:border-zinc-700'
              }`}
            >
              <span className={isSelected ? 'text-black' : ''}>{genre.icon}</span>
              <span>{genre.name}</span>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
};
