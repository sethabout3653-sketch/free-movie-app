import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

interface NavbarProps {
  onSearch: (query: string) => void;
  activeCategory: string;
  setActiveCategory: (category: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onSearch,
  activeCategory,
  setActiveCategory,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    onSearch(val);
  };

  const clearSearch = () => {
    setSearchQuery('');
    onSearch('');
    setSearchOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-500 ${
        isScrolled ? 'bg-black/95 backdrop-blur-md shadow-2xl border-b border-white/5' : 'bg-gradient-to-b from-black/90 via-black/50 to-transparent'
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 h-16 sm:h-20 flex items-center justify-between">
        {/* Navigation Row */}
        <div className="flex items-center gap-6 sm:gap-8 w-full justify-between">
          {/* Brand Logo */}
          <button
            onClick={() => {
              setActiveCategory('home');
              clearSearch();
            }}
            className="flex items-center gap-2 group focus:outline-none"
          >
            <span className="font-black text-2xl sm:text-3xl text-[#E50914] tracking-widest uppercase transform group-hover:scale-105 transition-all duration-300 drop-shadow-[0_2px_12px_rgba(229,9,20,0.6)] font-sans">
              FREEFLIX
            </span>
          </button>

          {/* Center Navigation Tabs with Pill Styling (matching image) */}
          <div className="flex items-center justify-center gap-2 sm:gap-4 text-sm font-medium">
            {/* Search Toggle */}
            <div className={`relative flex items-center transition-all duration-300 ${searchOpen ? 'w-48 sm:w-64 bg-black/90 border border-white/30 rounded-full px-3 py-1.5 shadow-lg' : 'w-auto'}`}>
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="text-gray-200 hover:text-white transition-colors focus:outline-none p-1.5 hover:bg-white/10 rounded-full flex items-center gap-1.5"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>
              {searchOpen && (
                <>
                  <input
                    type="text"
                    placeholder="Search movies & shows..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    autoFocus
                    className="bg-transparent text-white text-xs sm:text-sm pl-2 pr-6 w-full focus:outline-none placeholder-gray-400"
                  />
                  {searchQuery && (
                    <button onClick={clearSearch} className="absolute right-2 text-gray-400 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Nav Items */}
            <button
              onClick={() => { setActiveCategory('home'); clearSearch(); }}
              className={`px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm transition-all duration-200 ${
                activeCategory === 'home'
                  ? 'bg-zinc-800 text-white font-bold border border-white/20'
                  : 'text-zinc-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Home
            </button>

            <button
              onClick={() => { setActiveCategory('tv'); clearSearch(); }}
              className={`px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm transition-all duration-200 ${
                activeCategory === 'tv'
                  ? 'bg-zinc-800 text-white font-bold border border-white/20'
                  : 'text-zinc-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Shows
            </button>

            <button
              onClick={() => { setActiveCategory('movie'); clearSearch(); }}
              className={`px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm transition-all duration-200 ${
                activeCategory === 'movie'
                  ? 'bg-zinc-800 text-white font-bold border border-white/20'
                  : 'text-zinc-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Movies
            </button>
          </div>

          {/* Top Right Red Brand Logo 'N' (Matching image top-right N) */}
          <div className="flex items-center">
            <span className="text-[#E50914] font-black text-2xl sm:text-3xl tracking-tighter select-none drop-shadow-md">
              N
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
};
