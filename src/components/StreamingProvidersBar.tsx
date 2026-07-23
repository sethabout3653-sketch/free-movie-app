 import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
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
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-6 bg-[#E50914] rounded-full inline-block"></span>
          <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-wide uppercase font-sans flex items-center gap-2">
            <span>Streaming Networks & Studios</span>
            <Sparkles className="w-4 h-4 text-[#E50914]" />
          </h2>
        </div>
        {selectedProviderId && (
          <button
            onClick={() => onSelectProvider(null)}
            className="text-xs font-bold text-[#E50914] hover:text-white bg-red-950/60 border border-red-800/60 px-3 py-1 rounded-full transition-all"
          >
            Show All Content
          </button>
        )}
      </div>

      {/* Provider Cards Container with Left & Right Arrows */}
      <div className="relative">
        {/* Left Scroll Arrow */}
        <button
          onClick={() => handleScroll('left')}
          className="absolute left-0 top-0 bottom-0 z-30 bg-black/80 hover:bg-black/95 text-white px-2.5 rounded-r-xl opacity-90 sm:opacity-0 group-hover/providers:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-md border-r border-white/10"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Scrollable Container */}
        <div
          ref={rowRef}
          className="flex items-center gap-3 sm:gap-4 overflow-x-auto no-scrollbar py-3 px-1 scroll-smooth"
        >
          {/* 'All' Reset Card */}
          <button
            onClick={() => onSelectProvider(null)}
            className={`flex-shrink-0 w-28 sm:w-36 md:w-40 h-20 sm:h-24 md:h-28 rounded-2xl sm:rounded-3xl border font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center transition-all duration-300 transform hover:scale-105 shadow-2xl ${
              selectedProviderId === null
                ? 'bg-[#E50914] text-white border-red-500 shadow-red-950/80 scale-105 ring-2 ring-red-500'
                : 'bg-black text-white border-zinc-800 hover:border-zinc-500 hover:bg-zinc-950'
            }`}
          >
            All Networks
          </button>

          {STREAMING_PROVIDERS.map((provider) => {
            const isSelected = selectedProviderId === provider.id;
            // Use crisp vector SVG logo as primary for optimal fitting & resolution on dark/black backgrounds
            const logoUrl = provider.logoSvg || tmdbLogos[provider.id];

            return (
              <button
                key={provider.id}
                onClick={() => onSelectProvider(isSelected ? null : provider.id)}
                className={`flex-shrink-0 relative group/btn w-36 sm:w-48 md:w-56 h-20 sm:h-24 md:h-28 p-3 sm:p-5 rounded-2xl sm:rounded-3xl border flex items-center justify-center transition-all duration-300 transform hover:scale-105 shadow-2xl overflow-hidden ${
                  isSelected
                    ? 'bg-black border-2 border-[#E50914] ring-2 ring-[#E50914]/60 shadow-red-950/80 scale-105'
                    : 'bg-black border-zinc-800 hover:border-zinc-500 hover:bg-zinc-950'
                }`}
                title={`Filter by ${provider.name}`}
              >
                {/* High Quality Official Brand Logo - Full Fit Centered in Black Card */}
                <div className="w-full h-full flex items-center justify-center relative z-10 pointer-events-none">
                  <img
                    src={logoUrl}
                    alt={provider.name}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className={`max-w-[85%] max-h-[75%] w-auto h-auto object-contain transition-transform duration-300 group-hover/btn:scale-108 filter drop-shadow-[0_2px_6px_rgba(255,255,255,0.1)] ${
                      provider.invertOnDark ? 'brightness-0 invert' : ''
                    }`}
                    onError={(e) => {
                      // Fallback to TMDB logo if SVG fails
                      if (tmdbLogos[provider.id] && logoUrl !== tmdbLogos[provider.id]) {
                        (e.target as HTMLImageElement).src = tmdbLogos[provider.id];
                      }
                    }}
                  />
                </div>

                {/* Selected Active Badge */}
                {isSelected && (
                  <span className="absolute top-2.5 right-2.5 w-3.5 h-3.5 bg-[#E50914] rounded-full border-2 border-black animate-pulse z-20" />
                )}
              </button>
            );
          })}
        </div>

        {/* Right Scroll Arrow */}
        <button
          onClick={() => handleScroll('right')}
          className="absolute right-0 top-0 bottom-0 z-30 bg-black/80 hover:bg-black/95 text-white px-2.5 rounded-l-xl opacity-90 sm:opacity-0 group-hover/providers:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-md border-l border-white/10"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}; 