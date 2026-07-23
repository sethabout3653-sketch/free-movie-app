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
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-6 bg-[#E50914] rounded-full inline-block shadow-[0_0_10px_#E50914]"></span>
          <h2 className="text-lg sm:text-xl font-black text-white tracking-wide uppercase font-sans flex items-center gap-2">
            <span>Streaming Networks & Studios</span>
            <Sparkles className="w-4.5 h-4.5 text-[#E50914] animate-pulse" />
          </h2>
        </div>
        {selectedProviderId && (
          <button
            onClick={() => onSelectProvider(null)}
            className="text-xs font-extrabold text-[#E50914] hover:text-white bg-red-950/70 hover:bg-[#E50914] border border-red-800/60 px-3.5 py-1.5 rounded-full transition-all duration-300 shadow-lg"
          >
            Show All Content
          </button>
        )}
      </div>

      {/* Provider Cards Container with Left & Right Arrows */}
      <div className="relative">
        {/* Left Fade Gradient & Scroll Arrow */}
        <div className="absolute left-0 top-0 bottom-0 w-12 z-20 pointer-events-none bg-gradient-to-r from-black via-black/60 to-transparent rounded-l-2xl" />
        <button
          onClick={() => handleScroll('left')}
          className="absolute left-1 top-1/2 -translate-y-1/2 z-30 bg-black/90 hover:bg-[#E50914] text-white p-2 sm:p-2.5 rounded-full opacity-0 group-hover/providers:opacity-100 transition-all duration-300 backdrop-blur-md border border-white/20 shadow-2xl transform hover:scale-110"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Scrollable Container */}
        <div
          ref={rowRef}
          className="flex items-center gap-3 sm:gap-4 overflow-x-auto no-scrollbar py-3 px-1 scroll-smooth"
        >
          {/* 'All' Reset Card */}
          <button
            onClick={() => onSelectProvider(null)}
            className={`flex-shrink-0 w-28 sm:w-36 md:w-40 h-20 sm:h-24 md:h-28 rounded-2xl sm:rounded-3xl border font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center transition-all duration-300 transform hover:scale-105 shadow-2xl relative overflow-hidden ${
              selectedProviderId === null
                ? 'bg-gradient-to-br from-[#E50914] to-red-700 text-white border-red-500 shadow-[0_0_20px_rgba(229,9,20,0.6)] scale-105 ring-2 ring-red-400'
                : 'bg-zinc-950/90 text-white border-zinc-800 hover:border-zinc-500 hover:bg-zinc-900'
            }`}
          >
            <span className="relative z-10 flex items-center gap-1.5">
              <span>All Networks</span>
            </span>
          </button>

          {STREAMING_PROVIDERS.map((provider) => {
            const isSelected = selectedProviderId === provider.id;
            const logoUrl = provider.logoSvg || tmdbLogos[provider.id];
            const isFailed = failedLogos[provider.id];

            return (
              <button
                key={provider.id}
                onClick={() => onSelectProvider(isSelected ? null : provider.id)}
                className={`flex-shrink-0 relative group/btn w-36 sm:w-48 md:w-56 h-20 sm:h-24 md:h-28 p-3 sm:p-5 rounded-2xl sm:rounded-3xl border flex items-center justify-center transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 shadow-2xl overflow-hidden ${
                  isSelected
                    ? 'bg-black border-2 border-[#E50914] ring-2 ring-[#E50914]/70 shadow-[0_0_25px_rgba(229,9,20,0.5)] scale-105'
                    : 'bg-zinc-950/90 border-zinc-800/90 hover:border-zinc-500 hover:bg-black'
                }`}
                title={`Filter by ${provider.name}`}
              >
                {/* Subtle Brand Background Glow on Hover */}
                <div
                  className="absolute inset-0 opacity-0 group-hover/btn:opacity-15 transition-opacity duration-300 pointer-events-none rounded-2xl"
                  style={{ backgroundColor: provider.badgeColor || '#E50914' }}
                />

                {/* High Quality Official Brand Logo - Full Fit Centered in Black Card */}
                {!isFailed ? (
                  <div className="w-full h-full flex items-center justify-center relative z-10 pointer-events-none">
                    {provider.lightBg ? (
                      <div className="bg-white/95 hover:bg-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl shadow-lg flex items-center justify-center max-w-[90%] max-h-[80%] transition-all duration-300 group-hover/btn:scale-105">
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
                        className={`max-w-[85%] max-h-[75%] w-auto h-auto object-contain transition-all duration-300 group-hover/btn:scale-110 filter drop-shadow-[0_2px_8px_rgba(255,255,255,0.12)] ${
                          provider.invertOnDark ? 'brightness-0 invert' : ''
                        }`}
                        onError={(e) => {
                          // Fallback to TMDB logo if SVG fails
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
                      className="font-black text-xs sm:text-sm tracking-wider uppercase px-2 py-1 rounded-md text-white drop-shadow-md text-center line-clamp-1"
                      style={{ color: provider.badgeColor && provider.badgeColor !== '#000000' ? provider.badgeColor : '#ffffff' }}
                    >
                      {provider.name}
                    </span>
                  </div>
                )}

                {/* Selected Active Badge */}
                {isSelected && (
                  <span className="absolute top-2.5 right-2.5 w-3.5 h-3.5 bg-[#E50914] rounded-full border-2 border-black animate-pulse z-20 shadow-[0_0_8px_#E50914]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Right Fade Gradient & Scroll Arrow */}
        <div className="absolute right-0 top-0 bottom-0 w-12 z-20 pointer-events-none bg-gradient-to-l from-black via-black/60 to-transparent rounded-r-2xl" />
        <button
          onClick={() => handleScroll('right')}
          className="absolute right-1 top-1/2 -translate-y-1/2 z-30 bg-black/90 hover:bg-[#E50914] text-white p-2 sm:p-2.5 rounded-full opacity-0 group-hover/providers:opacity-100 transition-all duration-300 backdrop-blur-md border border-white/20 shadow-2xl transform hover:scale-110"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>
    </div>
  );
}; 