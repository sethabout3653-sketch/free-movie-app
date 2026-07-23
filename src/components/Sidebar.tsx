import React from 'react';
import { Search, Home, Zap, Bookmark, Film, Tv, Star } from 'lucide-react';
import { motion } from 'motion/react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenSearch: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenSearch,
}) => {
  const navItems = [
    { id: 'search', label: 'Search', icon: Search, action: onOpenSearch },
    { id: 'home', label: 'Home', icon: Home },
    { id: 'trending', label: 'Trending', icon: Zap },
    { id: 'watchlist', label: 'My List', icon: Bookmark },
    { id: 'movie', label: 'Movies', icon: Film },
    { id: 'tv', label: 'TV Shows', icon: Tv },
  ];

  return (
    <aside className="fixed left-0 top-0 bottom-0 z-50 w-14 sm:w-16 md:w-20 bg-black/90 backdrop-blur-2xl border-r border-white/10 flex flex-col items-center justify-center py-6 select-none transition-all duration-300">
      {/* Centered Vertical Icon Rail */}
      <div className="flex flex-col items-center justify-center gap-5 sm:gap-6 w-full">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (item.action) {
                  item.action();
                }
              }}
              className="relative group p-2.5 sm:p-3 rounded-2xl flex items-center justify-center transition-colors duration-200 outline-none"
              title={item.label}
              aria-label={item.label}
            >
              {/* Smooth Gliding Active Pill */}
              {isActive && (
                <motion.div
                  layoutId="sidebarActivePill"
                  className="absolute inset-0 bg-white rounded-2xl shadow-[0_0_20px_rgba(255,255,255,0.5)] z-0"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}

              <Icon
                className={`relative z-10 w-5 h-5 sm:w-6 sm:h-6 transition-all duration-300 ${
                  isActive
                    ? 'text-black stroke-[2.5] scale-110'
                    : 'text-zinc-400 group-hover:text-white group-hover:scale-105 stroke-2'
                }`}
              />

              {/* Tooltip on hover */}
              <span className="absolute left-full ml-3 px-2.5 py-1 bg-zinc-900 text-white text-xs font-bold rounded-lg border border-white/10 shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
};
