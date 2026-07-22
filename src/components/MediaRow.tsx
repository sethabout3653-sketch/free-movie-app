import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { MediaItem } from '../types';
import { MovieCard } from './MovieCard';

interface MediaRowProps {
  title: string;
  items: MediaItem[];
  onPlay: (item: MediaItem) => void;
  onMoreInfo?: (item: MediaItem) => void;
  icon?: React.ReactNode;
}

export const MediaRow: React.FC<MediaRowProps> = ({ title, items, onPlay, onMoreInfo, icon }) => {
  const rowRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollAmount = direction === 'left' ? scrollLeft - clientWidth * 0.75 : scrollLeft + clientWidth * 0.75;
      rowRef.current.scrollTo({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="space-y-3 my-6 px-4 sm:px-8 max-w-7xl mx-auto group/row"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-lg sm:text-xl md:text-2xl font-black text-white tracking-wide uppercase font-sans">
            {title}
          </h2>
        </div>
      </div>

      <div className="relative">
        {/* Left Arrow Scroll */}
        <button
          onClick={() => handleScroll('left')}
          className="absolute left-0 top-0 bottom-0 z-40 bg-black/70 hover:bg-black/90 text-white px-2 rounded-r-lg opacity-0 group-hover/row:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>

        {/* Scrollable Row */}
        <div
          ref={rowRef}
          className="flex items-center gap-3 sm:gap-4 overflow-x-auto no-scrollbar py-3 px-1 scroll-smooth"
        >
          {items.map((item) => (
            <MovieCard
              key={item.id}
              item={item}
              onPlay={onPlay}
              onMoreInfo={onMoreInfo}
            />
          ))}
        </div>

        {/* Right Arrow Scroll */}
        <button
          onClick={() => handleScroll('right')}
          className="absolute right-0 top-0 bottom-0 z-40 bg-black/70 hover:bg-black/90 text-white px-2 rounded-l-lg opacity-0 group-hover/row:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      </div>
    </motion.div>
  );
};
