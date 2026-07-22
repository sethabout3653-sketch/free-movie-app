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
          className="flex items-center gap-3 overflow-x-auto no-scrollbar py-2.5 px-1 scroll-smooth"
        >
          {/* 'All' Reset Pill */}
          <button
            onClick={() => onSelectProvider(null)}
            className={`flex-shrink-0 h-16 px-6 rounded-2xl border font-black text-xs sm:text-sm flex items-center justify-center transition-all duration-300 transform hover:scale-105 shadow-lg ${
              selectedProviderId === null
                ? 'bg-[#E50914] text-white border-red-500 shadow-red-950/80 scale-105 ring-2 ring-red-500'
                : 'bg-zinc-900/90 text-gray-300 border-zinc-800 hover:border-zinc-600 hover:text-white'
            }`}
          >
            All Networks
          </button>

          {STREAMING_PROVIDERS.map((provider) => {
            const isSelected = selectedProviderId === provider.id;
            const logoUrl = tmdbLogos[provider.id] || provider.logoSvg;

            return (
              <button
                key={provider.id}
                onClick={() => onSelectProvider(isSelected ? null : provider.id)}
                className={`flex-shrink-0 relative group/btn h-16 px-5 rounded-2xl border flex items-center justify-center gap-3 transition-all duration-300 transform hover:scale-105 shadow-xl ${
                  isSelected
                    ? 'bg-zinc-900 border-[#E50914] ring-2 ring-[#E50914] shadow-red-950/60 scale-105'
                    : 'bg-zinc-900/90 border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800/90'
                }`}
                title={`Filter by ${provider.name}`}
              >
                {/* High Quality Official Brand Logo Container */}
                <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center p-1.5 bg-white rounded-xl border border-white/20 shadow-md overflow-hidden group-hover/btn:scale-105 transition-all">
                  <img
                    src={logoUrl}
                    alt={provider.name}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain filter drop-shadow-sm"
                    onError={(e) => {
                      // Fallback to provider.logoSvg if tmdb logo fails
                      if (logoUrl !== provider.logoSvg) {
                        (e.target as HTMLImageElement).src = provider.logoSvg;
                      }
                    }}
                  />
                </div>

                {/* Studio / Network Label */}
                <span className={`font-bold text-xs sm:text-sm whitespace-nowrap tracking-wide transition-colors ${isSelected ? 'text-white font-extrabold' : 'text-gray-200 group-hover/btn:text-white'}`}>
                  {provider.name}
                </span>

                {/* Selected Active Badge */}
                {isSelected && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#E50914] rounded-full border-2 border-black animate-pulse" />
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
