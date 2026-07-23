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
          <span className="w-2.5 h-6 bg-white rounded-full inline-block shadow-[0_0_10px_rgba(255,255,255,0.8)]"></span>
          <h2 className="text-lg sm:text-xl font-black text-white tracking-wide uppercase font-sans flex items-center gap-2">
            <span>Streaming Networks & Studios</span>
            <Sparkles className="w-4.5 h-4.5 text-white" />
          </h2>
        </div>
        {selectedProviderId && (
          <button
            onClick={() => onSelectProvider(null)}
            className="text-xs font-extrabold text-black bg-white hover:bg-zinc-200 px-3.5 py-1.5 rounded-full transition-all duration-300 shadow-lg"
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
          className="absolute left-1 top-1/2 -translate-y-1/2 z-30 bg-black/90 hover:bg-white hover:text-black text-white p-2 sm:p-2.5 rounded-full opacity-0 group-hover/providers:opacity-100 transition-all duration-300 backdrop-blur-md border border-white/20 shadow-2xl transform hover:scale-110"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Scrollable Container */}
        <div
          ref={rowRef}
          className="flex items-center gap-3 sm:gap-4 overflow-x-auto no-scrollbar py-3 px-1 scroll-smooth"
        >
          {STREAMING_PROVIDERS.map((provider) => {
            const isSelected = selectedProviderId === provider.id;
            const logoUrl = provider.logoSvg || tmdbLogos[provider.id];
            const isFailed = failedLogos[provider.id];

            return (
              <button
                key={provider.id}
                onClick={() => onSelectProvider(isSelected ? null : provider.id)}
                className={`flex-shrink-0 relative group/btn w-36 sm:w-48 md:w-56 h-20 sm:h-24 md:h-28 p-3 sm:p-5 rounded-2xl border flex items-center justify-center transition-all duration-300 ease-out transform hover:-translate-y-1.5 hover:scale-105 shadow-2xl overflow-hidden ${
                  isSelected
                    ? 'bg-gradient-to-b from-zinc-900 via-black to-zinc-900 border-2 border-white ring-2 ring-white/80 shadow-[0_0_30px_rgba(255,255,255,0.3)] scale-105'
                    : 'bg-gradient-to-b from-zinc-900/90 to-zinc-950/90 border-zinc-800/80 hover:border-white/80 hover:shadow-[0_10px_30px_rgba(255,255,255,0.15)]'
                }`}
                title={`Filter by ${provider.name}`}
              >
                {/* Subtle Brand Background Glow on Hover */}
                <div
                  className="absolute inset-0 opacity-0 group-hover/btn:opacity-10 transition-opacity duration-300 pointer-events-none rounded-2xl bg-white"
                />

                {/* Glossy Diagonal Shimmer Light */}
                <div className="absolute -top-12 -left-12 w-24 h-48 bg-white/5 rotate-45 transform group-hover/btn:translate-x-64 transition-transform duration-700 ease-in-out pointer-events-none" />

                {/* High Quality Official Brand Logo */}
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
                    >
                      {provider.name}
                    </span>
                  </div>
                )}

                {/* Selected Active Indicator */}
                {isSelected && (
                  <span className="absolute top-2.5 right-2.5 w-3.5 h-3.5 bg-white rounded-full border-2 border-black animate-pulse z-20 shadow-[0_0_10px_white]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Right Fade Gradient & Scroll Arrow */}
        <div className="absolute right-0 top-0 bottom-0 w-12 z-20 pointer-events-none bg-gradient-to-l from-black via-black/60 to-transparent rounded-r-2xl" />
        <button
          onClick={() => handleScroll('right')}
          className="absolute right-1 top-1/2 -translate-y-1/2 z-30 bg-black/90 hover:bg-white hover:text-black text-white p-2 sm:p-2.5 rounded-full opacity-0 group-hover/providers:opacity-100 transition-all duration-300 backdrop-blur-md border border-white/20 shadow-2xl transform hover:scale-110"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>
    </div>
  );
}; 