import React from 'react';
import { Search } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenSearch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenSearch,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/90 via-black/50 to-transparent backdrop-blur-sm px-6 sm:px-12 py-5 transition-all">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between">
        {/* Left Navigation Group */}
        <div className="flex items-center gap-4 sm:gap-6 md:gap-8">
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
          <div className="flex items-center gap-2 sm:gap-3 text-sm sm:text-base font-semibold">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-4 sm:px-6 py-2 rounded-full transition-all duration-200 ${
                activeTab === 'home'
                  ? 'bg-white/90 text-black font-extrabold shadow-lg scale-105'
                  : 'text-zinc-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Home
            </button>

            <button
              onClick={() => setActiveTab('watchlist')}
              className={`px-4 sm:px-6 py-2 rounded-full transition-all duration-200 ${
                activeTab === 'watchlist'
                  ? 'bg-white/90 text-black font-extrabold shadow-lg scale-105'
                  : 'text-zinc-300 hover:text-white hover:bg-white/10'
              }`}
            >
              My Stuff
            </button>

            <button
              onClick={() => setActiveTab('tv')}
              className={`px-4 sm:px-6 py-2 rounded-full transition-all duration-200 ${
                activeTab === 'tv'
                  ? 'bg-white/90 text-black font-extrabold shadow-lg scale-105'
                  : 'text-zinc-300 hover:text-white hover:bg-white/10'
              }`}
            >
              TV Shows
            </button>

            <button
              onClick={() => setActiveTab('movie')}
              className={`px-4 sm:px-6 py-2 rounded-full transition-all duration-200 ${
                activeTab === 'movie'
                  ? 'bg-white/90 text-black font-extrabold shadow-lg scale-105'
                  : 'text-zinc-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Movies
            </button>
          </div>
        </div>

        {/* Right Logo Group (FREEFLIX - matching Hulu top right placement, NO USER ICON) */}
        <div className="flex items-center gap-3">
          <span className="text-white font-black text-2xl sm:text-3xl tracking-tight uppercase font-sans drop-shadow-md select-none">
            FREEFLIX
          </span>
        </div>
      </div>
    </header>
  );
};
