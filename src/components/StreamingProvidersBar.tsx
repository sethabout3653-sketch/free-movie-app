 import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { STREAMING_PROVIDERS, TMDB_BASE_URL, TMDB_API_KEY, TMDB_IMAGE_BASE } from '../services/tmdb';

interface StreamingProvidersBarProps {
  selectedProviderId: string | null;
  onSelectProvider: (providerId: string | null) => void;
}

export const StreamingProvidersBar: React.FC<StreamingProvidersBarProps> = ({
  selectedProviderId,
  onSelectProvider,
}) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const [tmdbLogos, setTmdbLogos] = useState<Record<string, string>>({});
  const [failedLogos, setFailedLogos] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Dynamically fetch official TMDB network/company logo images as primary/enhancement
    const fetchLogos = async () => {
      const logoMap: Record<string, string> = {};
      await Promise.all(
        STREAMING_PROVIDERS.map(async (provider) => {
          try {
            if (provider.networkId) {
              const res = await fetch(`${TMDB_BASE_URL}/network/${provider.networkId}?api_key=${TMDB_API_KEY}`);
              const data = await res.json();
              if (data?.logo_path) {
                logoMap[provider.id] = `${TMDB_IMAGE_BASE}/w500${data.logo_path}`;
                return;
              }
            }
            if (provider.companyId) {
              const res = await fetch(`${TMDB_BASE_URL}/company/${provider.companyId}?api_key=${TMDB_API_KEY}`);
              const data = await res.json();
              if (data?.logo_path) {
                logoMap[provider.id] = `${TMDB_IMAGE_BASE}/w500${data.logo_path}`;
                return;
              }
            }
          } catch (e) {
            // Ignore fetch error, will fallback to official Wikimedia vector SVG
          }
        })
      );
      setTmdbLogos(logoMap);
    };

    fetchLogos();
  }, []);

  const handleScroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollAmount = direction === 'left' ? scrollLeft - clientWidth * 0.75 : scrollLeft + clientWidth * 0.75;
      rowRef.current.scrollTo({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full my-6 px-4 sm:px-8 max-w-7xl mx-auto group/providers">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="w-2 h-7 bg-white rounded-full inline-block shadow-[0_0_12px_rgba(255,255,255,0.9)]"></span>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-widest uppercase font-sans flex items-center gap-2">
            <span>Networks & Studios</span>
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </h2>
        </div>
        <AnimatePresence>
          {selectedProviderId && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: 20 }}
              onClick={() => onSelectProvider(null)}
              className="text-xs font-black text-black bg-white hover:bg-zinc-200 px-4 py-2 rounded-full transition-colors shadow-[0_0_15px_rgba(255,255,255,0.5)] tracking-wide uppercase"
            >
              Clear Filter
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Provider Cards Container with Left & Right Arrows */}
      <div className="relative rounded-2xl overflow-hidden">
        {/* Left Fade Gradient & Scroll Arrow */}
        <div className="absolute left-0 top-0 bottom-0 w-16 z-20 pointer-events-none bg-gradient-to-r from-[#121214] via-[#121214]/80 to-transparent" />
        <button
          onClick={() => handleScroll('left')}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-30 bg-white hover:bg-zinc-200 text-black p-2.5 sm:p-3 rounded-full opacity-0 group-hover/providers:opacity-100 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.3)] transform hover:scale-110 -translate-x-4 group-hover/providers:translate-x-0"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Scrollable Container */}
        <div
          ref={rowRef}
          className="flex items-center gap-3 sm:gap-5 overflow-x-auto no-scrollbar py-4 px-2 scroll-smooth relative z-10"
        >
          {STREAMING_PROVIDERS.map((provider, idx) => {
            const isSelected = selectedProviderId === provider.id;
            const logoUrl = provider.logoSvg || tmdbLogos[provider.id];
            const isFailed = failedLogos[provider.id];

            return (
              <motion.button
                key={provider.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.05, ease: 'easeOut' }}
                onClick={() => onSelectProvider(isSelected ? null : provider.id)}
                className={`flex-shrink-0 relative group/btn w-40 sm:w-52 h-24 sm:h-28 p-4 rounded-3xl flex items-center justify-center transition-all duration-300 ease-out shadow-xl overflow-hidden ${
                  isSelected
                    ? 'bg-gradient-to-br from-zinc-800 to-black border-2 border-white ring-4 ring-white/20 scale-105 z-10'
                    : 'bg-zinc-900/80 border border-white/10 hover:border-white/50 hover:bg-zinc-800/90 hover:-translate-y-2'
                }`}
                title={`Filter by ${provider.name}`}
              >
                {/* Glossy Diagonal Shimmer Light */}
                <div className="absolute -top-20 -left-20 w-32 h-64 bg-white/10 rotate-45 transform group-hover/btn:translate-x-80 transition-transform duration-700 ease-in-out pointer-events-none" />

                {/* High Quality Official Brand Logo */}
                {!isFailed ? (
                  <div className="w-full h-full flex items-center justify-center relative z-10 pointer-events-none">
                    {provider.lightBg ? (
                      <div className="bg-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl shadow-lg flex items-center justify-center max-w-[90%] max-h-[80%] transition-transform duration-300 group-hover/btn:scale-110">
                        <img
                          src={logoUrl}
                          alt={provider.name}
                          loading="lazy"
                          referrerPolicy="no-referrer"
                          className="max-w-full max-h-10 sm:max-h-12 w-auto h-auto object-contain"
                          onError={(e) => {
                            if (tmdbLogos[provider.id] && logoUrl !== tmdbLogos[provider.id]) {
                              (e.target as HTMLImageElement).src = tmdbLogos[provider.id];
                            } else {
                              setFailedLogos((prev) => ({ ...prev, [provider.id]: true }));
                            }
                          }}
                        />
                      </div>
                    ) : (
                      <img
                        src={logoUrl}
                        alt={provider.name}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        className="max-w-[85%] max-h-[75%] w-auto h-auto object-contain transition-all duration-300 group-hover/btn:scale-110 filter drop-shadow-md"
                        onError={(e) => {
                          if (tmdbLogos[provider.id] && logoUrl !== tmdbLogos[provider.id]) {
                            (e.target as HTMLImageElement).src = tmdbLogos[provider.id];
                          } else {
                            setFailedLogos((prev) => ({ ...prev, [provider.id]: true }));
                          }
                        }}
                      />
                    )}
                  </div>
                ) : (
                  /* Stylized Text Badge Fallback */
                  <div className="w-full h-full flex items-center justify-center z-10">
                    <span
                      className="font-black text-sm sm:text-base tracking-widest uppercase px-3 py-1.5 rounded-lg bg-black/40 text-white border border-white/20 text-center line-clamp-1"
                    >
                      {provider.name}
                    </span>
                  </div>
                )}

                {/* Selected Active Indicator */}
                {isSelected && (
                  <motion.span
                    layoutId="activeProviderIndicator"
                    className="absolute top-3 right-3 w-3 h-3 bg-white rounded-full shadow-[0_0_12px_white] z-20"
                  />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Right Fade Gradient & Scroll Arrow */}
        <div className="absolute right-0 top-0 bottom-0 w-16 z-20 pointer-events-none bg-gradient-to-l from-[#121214] via-[#121214]/80 to-transparent" />
        <button
          onClick={() => handleScroll('right')}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-30 bg-white hover:bg-zinc-200 text-black p-2.5 sm:p-3 rounded-full opacity-0 group-hover/providers:opacity-100 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.3)] transform hover:scale-110 translate-x-4 group-hover/providers:translate-x-0"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}; 