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
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="space-y-3 my-8 px-4 sm:px-8 max-w-[1440px] mx-auto group/row"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="w-1.5 h-6 bg-[#E50914] rounded-full inline-block shadow-[0_0_12px_#E50914]" />
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
          className="absolute -left-3 sm:-left-4 top-1/2 -translate-y-1/2 z-40 bg-black/80 hover:bg-[#E50914] text-white p-2 sm:p-2.5 rounded-full opacity-0 group-hover/row:opacity-100 transition-all duration-300 backdrop-blur-md border border-white/20 shadow-2xl transform hover:scale-110"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7" />
        </button>

        {/* Scrollable Row */}
        <div
          ref={rowRef}
          className="flex items-center gap-3 sm:gap-5 overflow-x-auto no-scrollbar py-4 px-1 scroll-smooth"
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
          className="absolute -right-3 sm:-right-4 top-1/2 -translate-y-1/2 z-40 bg-black/80 hover:bg-[#E50914] text-white p-2 sm:p-2.5 rounded-full opacity-0 group-hover/row:opacity-100 transition-all duration-300 backdrop-blur-md border border-white/20 shadow-2xl transform hover:scale-110"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7" />
        </button>
      </div>
    </motion.div>
  );
};
