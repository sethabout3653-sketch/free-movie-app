import React, { useState, useEffect } from 'react';
import { Search, Bell, Film, Tv, X } from 'lucide-react';

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
        isScrolled ? 'bg-[#141414]/95 backdrop-blur-md shadow-2xl border-b border-white/5' : 'bg-gradient-to-b from-black/90 via-black/50 to-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        {/* Left section: Logo & Nav Links */}
        <div className="flex items-center gap-6 sm:gap-10">
          <button
            onClick={() => {
              setActiveCategory('home');
              clearSearch();
            }}
            className="flex items-center gap-1 group text-left focus:outline-none"
          >
            <span className="font-netflix text-3xl sm:text-4xl tracking-wider text-[#E50914] drop-shadow-[0_2px_10px_rgba(229,9,20,0.5)] transform group-hover:scale-105 transition-transform duration-200">
              FREEFLIX
            </span>
          </button>

          {/* Nav Categories */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            <button
              onClick={() => { setActiveCategory('home'); clearSearch(); }}
              className={`transition-colors duration-200 ${activeCategory === 'home' ? 'text-white font-bold' : 'text-gray-300 hover:text-gray-100'}`}
            >
              Home
            </button>
            <button
              onClick={() => { setActiveCategory('tv'); clearSearch(); }}
              className={`flex items-center gap-1.5 transition-colors duration-200 ${activeCategory === 'tv' ? 'text-white font-bold' : 'text-gray-300 hover:text-gray-100'}`}
            >
              <Tv className="w-4 h-4 text-[#E50914]" />
              TV Shows
            </button>
            <button
              onClick={() => { setActiveCategory('movie'); clearSearch(); }}
              className={`flex items-center gap-1.5 transition-colors duration-200 ${activeCategory === 'movie' ? 'text-white font-bold' : 'text-gray-300 hover:text-gray-100'}`}
            >
              <Film className="w-4 h-4 text-[#E50914]" />
              Movies
            </button>
            <button
              onClick={() => { setActiveCategory('trending'); clearSearch(); }}
              className={`transition-colors duration-200 ${activeCategory === 'trending' ? 'text-white font-bold' : 'text-gray-300 hover:text-gray-100'}`}
            >
              New & Popular
            </button>
          </div>
        </div>

        {/* Right section: Search */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Search box */}
          <div className={`relative flex items-center transition-all duration-300 ${searchOpen ? 'w-48 sm:w-72 bg-black/80 border border-white/30 rounded-full px-3 py-1.5 shadow-lg' : 'w-9'}`}>
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="text-gray-300 hover:text-white transition-colors focus:outline-none p-1.5 hover:bg-white/10 rounded-full"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
            {searchOpen && (
              <>
                <input
                  type="text"
                  placeholder="Titles, people, genres..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  autoFocus
                  className="bg-transparent text-white text-xs sm:text-sm pl-2.5 pr-6 w-full focus:outline-none placeholder-gray-400"
                />
                {searchQuery && (
                  <button onClick={clearSearch} className="absolute right-2 text-gray-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </>
            )}
          </div>

          <button className="text-gray-300 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full relative hidden sm:block">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#E50914] rounded-full ring-2 ring-black animate-pulse"></span>
          </button>
        </div>
      </div>

      {/* Mobile Category Navigation Strip */}
      <div className="md:hidden flex items-center justify-around bg-black/90 border-t border-white/10 px-2 py-2 text-xs font-medium text-gray-300">
        <button
          onClick={() => { setActiveCategory('home'); clearSearch(); }}
          className={activeCategory === 'home' ? 'text-[#E50914] font-bold' : ''}
        >
          Home
        </button>
        <button
          onClick={() => { setActiveCategory('tv'); clearSearch(); }}
          className={activeCategory === 'tv' ? 'text-[#E50914] font-bold' : ''}
        >
          TV Shows
        </button>
        <button
          onClick={() => { setActiveCategory('movie'); clearSearch(); }}
          className={activeCategory === 'movie' ? 'text-[#E50914] font-bold' : ''}
        >
          Movies
        </button>
        <button
          onClick={() => { setActiveCategory('trending'); clearSearch(); }}
          className={activeCategory === 'trending' ? 'text-[#E50914] font-bold' : ''}
        >
          New & Popular
        </button>
      </div>
    </nav>
  );
};
