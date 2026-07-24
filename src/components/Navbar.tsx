import React from 'react';
import { Search, Sparkles } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenSearch: () => void;
  onSurpriseMe?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenSearch,
  onSurpriseMe,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/90 via-black/50 to-transparent backdrop-blur-sm px-4 sm:px-12 py-4 transition-all">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between">
        {/* Left Navigation Group */}
        <div className="flex items-center gap-3 sm:gap-6 md:gap-8">
          {/* Search Icon Button */}
          <button
            onClick={onOpenSearch}
            className={`p-2.5 rounded-full transition-all duration-200 ${
              activeTab === 'search'
                ? 'bg-white text-black font-bold'
                : 'text-zinc-300 hover:text-white hover:bg-white/10'
            }`}
            title="Search"
            aria-label="Search"
          >
            <Search className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Nav Tabs */}
          <div className="flex items-center gap-1.5 sm:gap-3 text-sm sm:text-base font-semibold">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-3.5 sm:px-6 py-2 rounded-full transition-all duration-200 ${
                activeTab === 'home'
                  ? 'bg-white/90 text-black font-extrabold shadow-lg scale-105'
                  : 'text-zinc-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Home
            </button>

            <button
              onClick={() => setActiveTab('watchlist')}
              className={`px-3.5 sm:px-6 py-2 rounded-full transition-all duration-200 ${
                activeTab === 'watchlist'
                  ? 'bg-white/90 text-black font-extrabold shadow-lg scale-105'
                  : 'text-zinc-300 hover:text-white hover:bg-white/10'
              }`}
            >
              My Stuff
            </button>

            <button
              onClick={() => setActiveTab('tv')}
              className={`px-3.5 sm:px-6 py-2 rounded-full transition-all duration-200 ${
                activeTab === 'tv'
                  ? 'bg-white/90 text-black font-extrabold shadow-lg scale-105'
                  : 'text-zinc-300 hover:text-white hover:bg-white/10'
              }`}
            >
              TV Shows
            </button>

            <button
              onClick={() => setActiveTab('movie')}
              className={`px-3.5 sm:px-6 py-2 rounded-full transition-all duration-200 ${
                activeTab === 'movie'
                  ? 'bg-white/90 text-black font-extrabold shadow-lg scale-105'
                  : 'text-zinc-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Movies
            </button>
          </div>
        </div>

        {/* Right Action & Logo Group */}
        <div className="flex items-center gap-3">
          {onSurpriseMe && (
            <button
              onClick={onSurpriseMe}
              className="hidden md:flex items-center gap-1.5 bg-zinc-900/90 hover:bg-white hover:text-black border border-white/20 text-white text-xs font-black uppercase tracking-wider px-3.5 py-2 rounded-full transition-all backdrop-blur-md shadow-lg transform hover:scale-105"
              title="Pick a random movie or TV show"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Surprise Me</span>
            </button>
          )}

          <span className="text-white font-black text-2xl sm:text-3xl tracking-tight uppercase font-sans drop-shadow-md select-none">
            FREEFLIX
          </span>
        </div>
      </div>
    </header>
  );
};

