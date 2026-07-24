import React, { useState, useEffect } from 'react';
import {
  Film,
  Tv,
  Sparkles,
  Flame,
  Clapperboard,
  Search,
  X,
  Bookmark,
  Filter,
  Tv2,
  Play,
  Info,
  Trash2,
  Clock,
  Star,
  Zap,
  CheckCircle2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MediaItem, MediaType } from './types';
import { STREAMING_PROVIDERS, fetchTMDB } from './services/tmdb';

import { Navbar } from './components/Navbar';
import { HeroBannerDisney } from './components/HeroBannerDisney';
import { StreamingProvidersBar } from './components/StreamingProvidersBar';
import { GenreNavigationBar, GenreOption } from './components/GenreNavigationBar';
import { MediaRow } from './components/MediaRow';
import { MovieCard } from './components/MovieCard';
import { PlayerModal } from './components/PlayerModal';
import { DetailModal } from './components/DetailModal';
import { Top10Row } from './components/Top10Row';

interface WatchHistoryItem {
  item: MediaItem;
  season?: number;
  episode?: number;
  updatedAt: number;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 2800);
  };

  // Watch History / Continue Watching state
  const [continueWatching, setContinueWatching] = useState<WatchHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('freeflix_history');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Watchlist state (persistent in localStorage)
  const [watchlist, setWatchlist] = useState<MediaItem[]>(() => {
    try {
      const saved = localStorage.getItem('freeflix_watchlist');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const handleToggleWatchlist = (item: MediaItem) => {
    setWatchlist((prev) => {
      const exists = prev.some((i) => i.id === item.id);
      let next: MediaItem[];
      const mediaTitle = item.title || item.name || 'Title';
      if (exists) {
        next = prev.filter((i) => i.id !== item.id);
        showToast(`Removed "${mediaTitle}" from My Stuff`);
      } else {
        next = [item, ...prev];
        showToast(`Saved "${mediaTitle}" to My Stuff`);
      }
      try {
        localStorage.setItem('freeflix_watchlist', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  // Watchlist sub-tab filter
  const [watchlistFilter, setWatchlistFilter] = useState<'all' | 'movie' | 'tv'>('all');

  // Search state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<MediaItem[]>([]);
  const [searchTypeFilter, setSearchTypeFilter] = useState<'all' | 'movie' | 'tv'>('all');

  // Home Datasets
  const [heroItems, setHeroItems] = useState<MediaItem[]>([]);
  const [popularMovies, setPopularMovies] = useState<MediaItem[]>([]);
  const [topTv, setTopTv] = useState<MediaItem[]>([]);
  const [actionMovies, setActionMovies] = useState<MediaItem[]>([]);
  const [animeShows, setAnimeShows] = useState<MediaItem[]>([]);

  // Movies Tab Specific Datasets
  const [topRatedMovies, setTopRatedMovies] = useState<MediaItem[]>([]);
  const [sciFiMovies, setSciFiMovies] = useState<MediaItem[]>([]);
  const [horrorMovies, setHorrorMovies] = useState<MediaItem[]>([]);
  const [comedyMovies, setComedyMovies] = useState<MediaItem[]>([]);
  const [movieGenreFilter, setMovieGenreFilter] = useState<string>('all');

  // TV Shows Tab Specific Datasets
  const [tvDramas, setTvDramas] = useState<MediaItem[]>([]);
  const [tvComedies, setTvComedies] = useState<MediaItem[]>([]);
  const [tvSciFi, setTvSciFi] = useState<MediaItem[]>([]);
  const [tvCrime, setTvCrime] = useState<MediaItem[]>([]);
  const [tvGenreFilter, setTvGenreFilter] = useState<string>('all');

  // Provider filter dataset
  const [providerMovies, setProviderMovies] = useState<MediaItem[]>([]);

  // Genre filtering state
  const [selectedGenreOption, setSelectedGenreOption] = useState<GenreOption | null>(null);
  const [genreMovies, setGenreMovies] = useState<MediaItem[]>([]);
  const [genreTvShows, setGenreTvShows] = useState<MediaItem[]>([]);

  // Modals state
  const [playerMedia, setPlayerMedia] = useState<MediaItem | null>(null);
  const [playerSeason, setPlayerSeason] = useState<number>(1);
  const [playerEpisode, setPlayerEpisode] = useState<number>(1);
  const [detailMedia, setDetailMedia] = useState<MediaItem | null>(null);

  // Scroll to top when tab changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  // Initial Data Fetching - Load Distinct Datasets for Home, Movies & TV Shows
  useEffect(() => {
    async function loadAllData() {
      try {
        const [
          trendingRes,
          moviesRes,
          tvRes,
          actionRes,
          animeRes,
          topRatedMoviesRes,
          sciFiMoviesRes,
          horrorMoviesRes,
          comedyMoviesRes,
          tvDramasRes,
          tvComediesRes,
          tvSciFiRes,
          tvCrimeRes,
        ] = await Promise.all([
          fetchTMDB('/trending/all/week'),
          fetchTMDB('/movie/popular'),
          fetchTMDB('/tv/popular'),
          fetchTMDB('/discover/movie', { with_genres: '28' }),
          fetchTMDB('/discover/tv', { with_genres: '16' }),
          fetchTMDB('/movie/top_rated'),
          fetchTMDB('/discover/movie', { with_genres: '878' }),
          fetchTMDB('/discover/movie', { with_genres: '27' }),
          fetchTMDB('/discover/movie', { with_genres: '35' }),
          fetchTMDB('/discover/tv', { with_genres: '18' }),
          fetchTMDB('/discover/tv', { with_genres: '35' }),
          fetchTMDB('/discover/tv', { with_genres: '10765' }),
          fetchTMDB('/discover/tv', { with_genres: '80' }),
        ]);

        setHeroItems(trendingRes.results || []);

        setPopularMovies(
          (moviesRes.results || []).map((m: MediaItem) => ({ ...m, media_type: 'movie' as MediaType }))
        );
        setTopTv(
          (tvRes.results || []).map((t: MediaItem) => ({ ...t, media_type: 'tv' as MediaType }))
        );
        setActionMovies(
          (actionRes.results || []).map((m: MediaItem) => ({ ...m, media_type: 'movie' as MediaType }))
        );
        setAnimeShows(
          (animeRes.results || []).map((a: MediaItem) => ({ ...a, media_type: 'tv' as MediaType }))
        );

        // Movie Hub
        setTopRatedMovies(
          (topRatedMoviesRes.results || []).map((m: MediaItem) => ({ ...m, media_type: 'movie' as MediaType }))
        );
        setSciFiMovies(
          (sciFiMoviesRes.results || []).map((m: MediaItem) => ({ ...m, media_type: 'movie' as MediaType }))
        );
        setHorrorMovies(
          (horrorMoviesRes.results || []).map((m: MediaItem) => ({ ...m, media_type: 'movie' as MediaType }))
        );
        setComedyMovies(
          (comedyMoviesRes.results || []).map((m: MediaItem) => ({ ...m, media_type: 'movie' as MediaType }))
        );

        // TV Hub
        setTvDramas(
          (tvDramasRes.results || []).map((t: MediaItem) => ({ ...t, media_type: 'tv' as MediaType }))
        );
        setTvComedies(
          (tvComediesRes.results || []).map((t: MediaItem) => ({ ...t, media_type: 'tv' as MediaType }))
        );
        setTvSciFi(
          (tvSciFiRes.results || []).map((t: MediaItem) => ({ ...t, media_type: 'tv' as MediaType }))
        );
        setTvCrime(
          (tvCrimeRes.results || []).map((t: MediaItem) => ({ ...t, media_type: 'tv' as MediaType }))
        );
      } catch (err) {
        console.error('Error fetching TMDB data:', err);
      }
    }
    loadAllData();
  }, []);

  // Fetch when Streaming Provider Hub selected
  useEffect(() => {
    if (!selectedProviderId) {
      setProviderMovies([]);
      return;
    }

    const providerObj = STREAMING_PROVIDERS.find((p) => p.id === selectedProviderId);
    if (!providerObj) return;

    async function loadProviderContent() {
      try {
        let results: MediaItem[] = [];
        if (providerObj.networkId) {
          const res = await fetchTMDB('/discover/tv', { with_networks: providerObj.networkId.toString() });
          results = (res.results || []).map((item: MediaItem) => ({ ...item, media_type: 'tv' as MediaType }));
        }
        if (providerObj.companyId) {
          const resCompany = await fetchTMDB('/discover/movie', { with_companies: providerObj.companyId.toString() });
          const companyMovies = (resCompany.results || []).map((item: MediaItem) => ({ ...item, media_type: 'movie' as MediaType }));
          results = [...results, ...companyMovies];
        }
        if (results.length < 10 && providerObj.providerId) {
          const resMovie = await fetchTMDB('/discover/movie', { with_watch_providers: providerObj.providerId.toString(), watch_region: 'US' });
          const movies = (resMovie.results || []).map((item: MediaItem) => ({ ...item, media_type: 'movie' as MediaType }));
          results = [...results, ...movies];
        }
        setProviderMovies(results);
      } catch (e) {
        console.error('Failed to load provider content:', e);
      }
    }
    loadProviderContent();
  }, [selectedProviderId]);

  // Fetch when Genre selected
  useEffect(() => {
    if (!selectedGenreOption || selectedGenreOption.id === null) {
      setGenreMovies([]);
      setGenreTvShows([]);
      return;
    }

    async function loadGenreContent() {
      try {
        const movieGenreId = selectedGenreOption?.movieGenreId || selectedGenreOption?.id;
        const tvGenreId = selectedGenreOption?.tvGenreId || selectedGenreOption?.id;

        const [movieRes, tvRes] = await Promise.all([
          movieGenreId ? fetchTMDB('/discover/movie', { with_genres: movieGenreId.toString() }) : Promise.resolve({ results: [] }),
          tvGenreId ? fetchTMDB('/discover/tv', { with_genres: tvGenreId.toString() }) : Promise.resolve({ results: [] }),
        ]);

        setGenreMovies(
          (movieRes.results || []).map((m: MediaItem) => ({ ...m, media_type: 'movie' as MediaType }))
        );
        setGenreTvShows(
          (tvRes.results || []).map((t: MediaItem) => ({ ...t, media_type: 'tv' as MediaType }))
        );
      } catch (e) {
        console.error('Failed to load genre content:', e);
      }
    }

    loadGenreContent();
  }, [selectedGenreOption]);

  // Search logic
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const data = await fetchTMDB('/search/multi', { query: searchQuery });
        const filtered = (data.results || []).filter(
          (item: MediaItem) => item.media_type === 'movie' || item.media_type === 'tv'
        );
        setSearchResults(filtered);
      } catch (e) {
        console.error('Search error:', e);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Keyboard shortcuts (Escape key listener)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (playerMedia) setPlayerMedia(null);
        else if (detailMedia) setDetailMedia(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playerMedia, detailMedia]);

  const handlePlayMedia = (item: MediaItem, season: number = 1, episode: number = 1) => {
    setPlayerMedia(item);
    setPlayerSeason(season);
    setPlayerEpisode(episode);

    // Save item to Continue Watching history
    setContinueWatching((prev) => {
      const filtered = prev.filter((h) => h.item.id !== item.id);
      const updated: WatchHistoryItem = {
        item,
        season,
        episode,
        updatedAt: Date.now(),
      };
      const next = [updated, ...filtered].slice(0, 12);
      try {
        localStorage.setItem('freeflix_history', JSON.stringify(next));
      } catch (e) {}
      return next;
    });

    const title = item.title || item.name || 'Title';
    showToast(`Streaming ${title}${item.title ? '' : ` (S${season} E${episode})`}`);
  };

  const handleSurpriseMe = () => {
    const pool = [...heroItems, ...popularMovies, ...topTv].filter(Boolean);
    if (pool.length === 0) return;
    const randomPick = pool[Math.floor(Math.random() * pool.length)];
    setDetailMedia(randomPick);
    const title = randomPick.title || randomPick.name || 'Title';
    showToast(`Surprise Pick: "${title}"!`);
  };

  const handleMoreInfo = (item: MediaItem) => {
    setDetailMedia(item);
  };

  const selectedProviderName = STREAMING_PROVIDERS.find((p) => p.id === selectedProviderId)?.name;

  // Filtered Watchlist items
  const filteredWatchlist = watchlist.filter((item) => {
    if (watchlistFilter === 'all') return true;
    const type = item.media_type || (item.title ? 'movie' : 'tv');
    return type === watchlistFilter;
  });

  return (
    <div className="min-h-screen bg-[#060608] text-white font-sans antialiased pb-20 selection:bg-white selection:text-black relative overflow-x-hidden">
      {/* Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'search') {
            setSearchQuery('');
          }
        }}
        onOpenSearch={() => setActiveTab('search')}
        onSurpriseMe={handleSurpriseMe}
      />

      {/* Main View Area */}
      <main className="relative z-10 space-y-6 pt-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            {/* ==================== 1. SEARCH TAB ==================== */}
            {activeTab === 'search' && (
              <div className="pt-24 sm:pt-28 px-4 sm:px-12 max-w-7xl mx-auto space-y-8 min-h-[85vh]">
                {/* Search Header Box */}
                <div className="bg-zinc-900/90 border border-white/15 p-4 sm:p-6 rounded-3xl shadow-2xl backdrop-blur-2xl max-w-3xl mx-auto space-y-4">
                  <div className="flex items-center gap-3 bg-black/60 border border-white/10 rounded-2xl px-4 py-3 sm:py-4">
                    <Search className="w-6 h-6 text-zinc-400 shrink-0" />
                    <input
                      type="text"
                      placeholder="Search movies, TV shows, genres..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      autoFocus
                      className="bg-transparent text-white text-base sm:text-lg w-full focus:outline-none placeholder-zinc-500 font-medium"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="p-1.5 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  {/* Filter Chips */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    <button
                      onClick={() => setSearchTypeFilter('all')}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                        searchTypeFilter === 'all'
                          ? 'bg-white text-black shadow-lg'
                          : 'bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      All Results
                    </button>
                    <button
                      onClick={() => setSearchTypeFilter('movie')}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                        searchTypeFilter === 'movie'
                          ? 'bg-white text-black shadow-lg'
                          : 'bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      Movies
                    </button>
                    <button
                      onClick={() => setSearchTypeFilter('tv')}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                        searchTypeFilter === 'tv'
                          ? 'bg-white text-black shadow-lg'
                          : 'bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      TV Shows
                    </button>
                  </div>
                </div>

                {/* Popular Search Tags */}
                {!searchQuery && (
                  <div className="max-w-3xl mx-auto space-y-3">
                    <div className="text-xs font-extrabold uppercase tracking-wider text-zinc-400">
                      Trending Search Ideas:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {[
                        'Breaking Bad',
                        'Stranger Things',
                        'Marvel',
                        'Anime',
                        'Oppenheimer',
                        'Action',
                        'The Batman',
                        'Sci-Fi Thrillers',
                      ].map((tag) => (
                        <button
                          key={tag}
                          onClick={() => setSearchQuery(tag)}
                          className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-white/10 rounded-full text-xs text-zinc-300 hover:text-white font-medium transition-all"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Search Results OR Popular Discoveries */}
                {searchQuery.trim() ? (
                  <div>
                    <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                      <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                        Results for <span className="underline">"{searchQuery}"</span>
                      </h2>
                      <span className="text-xs font-bold text-zinc-400 bg-white/10 px-3 py-1 rounded-full border border-white/10">
                        {searchResults.length} Titles
                      </span>
                    </div>

                    {searchResults.length === 0 ? (
                      <div className="py-20 text-center space-y-3 bg-zinc-900/30 rounded-3xl border border-white/10 my-6 max-w-xl mx-auto">
                        <p className="text-zinc-400 text-base font-medium">
                          No titles found matching <span className="text-white font-bold">"{searchQuery}"</span>.
                        </p>
                      </div>
                    ) : (
                      (() => {
                        const displayed = searchResults.filter((item) => {
                          if (searchTypeFilter === 'all') return true;
                          const type = item.media_type || (item.title ? 'movie' : 'tv');
                          return type === searchTypeFilter;
                        });

                        return (
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 sm:gap-8 pb-20">
                            {displayed.map((item) => (
                              <MovieCard
                                key={item.id}
                                item={item}
                                fullWidth={true}
                                onPlay={handlePlayMedia}
                                onMoreInfo={handleMoreInfo}
                                isSaved={watchlist.some((w) => w.id === item.id)}
                                onToggleWatchlist={handleToggleWatchlist}
                              />
                            ))}
                          </div>
                        );
                      })()
                    )}
                  </div>
                ) : (
                  <div className="space-y-6 pt-2">
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                      <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase">
                        Popular Discoveries
                      </h2>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 sm:gap-8 pb-16">
                      {heroItems.slice(0, 10).map((item) => (
                        <MovieCard
                          key={item.id}
                          item={item}
                          fullWidth={true}
                          onPlay={handlePlayMedia}
                          onMoreInfo={handleMoreInfo}
                          isSaved={watchlist.some((w) => w.id === item.id)}
                          onToggleWatchlist={handleToggleWatchlist}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ==================== 2. HOME TAB ==================== */}
            {activeTab === 'home' && (
              <>
                {heroItems.length > 0 && (
                  <HeroBannerDisney
                    items={heroItems}
                    onPlay={handlePlayMedia}
                    onMoreInfo={handleMoreInfo}
                    watchlist={watchlist}
                    onToggleWatchlist={handleToggleWatchlist}
                  />
                )}

                {/* Top 10 Ranked Row with Overlapping Giant Numbers */}
                <Top10Row
                  title="Top 10 Today"
                  items={heroItems.length > 0 ? heroItems : popularMovies}
                  onPlay={handlePlayMedia}
                  onMoreInfo={handleMoreInfo}
                  watchlist={watchlist}
                  onToggleWatchlist={handleToggleWatchlist}
                />

                <div className="space-y-8 px-2 sm:px-6 pt-4">
                  {/* Continue Watching Row */}
                  {continueWatching.length > 0 && (
                    <div className="space-y-4 px-2 sm:px-6 my-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="w-1.5 h-5 bg-white rounded-full inline-block shadow-[0_0_10px_white]" />
                          <Clock className="w-5 h-5 text-white" />
                          <h2 className="text-lg sm:text-2xl font-black text-white uppercase tracking-tight">
                            Continue Watching
                          </h2>
                        </div>
                        <button
                          onClick={() => {
                            setContinueWatching([]);
                            localStorage.removeItem('freeflix_history');
                            showToast('Cleared watching history');
                          }}
                          className="text-xs font-bold text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5 bg-zinc-900/80 px-3 py-1.5 rounded-full border border-white/10"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Clear History</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-2">
                        {continueWatching.map(({ item, season, episode }) => {
                          const title = item.title || item.name || 'Untitled';
                          const isTv = (item.media_type || (item.name ? 'tv' : 'movie')) === 'tv';
                          const poster = item.backdrop_path
                            ? `https://image.tmdb.org/t/p/w500${item.backdrop_path}`
                            : `https://image.tmdb.org/t/p/w500${item.poster_path}`;

                          return (
                            <div
                              key={item.id}
                              onClick={() => handlePlayMedia(item, season || 1, episode || 1)}
                              className="group flex-shrink-0 w-48 sm:w-64 bg-zinc-900/90 rounded-2xl overflow-hidden border border-white/10 hover:border-white transition-all cursor-pointer shadow-xl transform hover:-translate-y-1"
                            >
                              <div className="relative aspect-video w-full overflow-hidden bg-black">
                                <img
                                  src={poster}
                                  alt={title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                />
                                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                  <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform">
                                    <Play className="w-5 h-5 fill-black ml-0.5 text-black" />
                                  </div>
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-800">
                                  <div className="h-full bg-white w-2/3 shadow-[0_0_8px_white]" />
                                </div>
                              </div>
                              <div className="p-3">
                                <p className="font-extrabold text-xs sm:text-sm text-white line-clamp-1">{title}</p>
                                <p className="text-[10px] text-zinc-400 font-bold uppercase mt-0.5">
                                  {isTv ? `S${season || 1} E${episode || 1}` : 'Movie'} • Resume Play
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <StreamingProvidersBar
                    selectedProviderId={selectedProviderId}
                    onSelectProvider={(id) => setSelectedProviderId(id)}
                  />

                  <GenreNavigationBar
                    selectedGenreId={selectedGenreOption?.id ?? null}
                    onSelectGenre={(genre) => {
                      setSelectedGenreOption(genre.id === null ? null : genre);
                    }}
                  />

                  {/* Filtered by Genre */}
                  {selectedGenreOption && selectedGenreOption.id !== null && (
                    <div className="space-y-6 my-4">
                      {genreMovies.length > 0 && (
                        <MediaRow
                          title={`${selectedGenreOption.name} Movies`}
                          items={genreMovies}
                          onPlay={handlePlayMedia}
                          onMoreInfo={handleMoreInfo}
                          icon={selectedGenreOption.icon}
                          watchlist={watchlist}
                          onToggleWatchlist={handleToggleWatchlist}
                        />
                      )}
                      {genreTvShows.length > 0 && (
                        <MediaRow
                          title={`${selectedGenreOption.name} TV Shows & Series`}
                          items={genreTvShows}
                          onPlay={handlePlayMedia}
                          onMoreInfo={handleMoreInfo}
                          icon={selectedGenreOption.icon}
                          watchlist={watchlist}
                          onToggleWatchlist={handleToggleWatchlist}
                        />
                      )}
                    </div>
                  )}

                  {/* Filtered by Streaming Provider */}
                  {selectedProviderId && providerMovies.length > 0 && (
                    <MediaRow
                      title={`Top Titles on ${selectedProviderName}`}
                      items={providerMovies}
                      onPlay={handlePlayMedia}
                      onMoreInfo={handleMoreInfo}
                      icon={<Sparkles className="w-6 h-6 text-white" />}
                      watchlist={watchlist}
                      onToggleWatchlist={handleToggleWatchlist}
                    />
                  )}

                  {/* Home Rows */}
                  <MediaRow
                    title="TV FOR YOU"
                    items={topTv}
                    onPlay={handlePlayMedia}
                    onMoreInfo={handleMoreInfo}
                    icon={<Tv className="w-5 h-5 text-white" />}
                    watchlist={watchlist}
                    onToggleWatchlist={handleToggleWatchlist}
                  />
                  <MediaRow
                    title="MOVIES FOR YOU"
                    items={popularMovies}
                    onPlay={handlePlayMedia}
                    onMoreInfo={handleMoreInfo}
                    icon={<Film className="w-5 h-5 text-white" />}
                    watchlist={watchlist}
                    onToggleWatchlist={handleToggleWatchlist}
                  />
                  <MediaRow
                    title="POPULAR ACTION"
                    items={actionMovies}
                    onPlay={handlePlayMedia}
                    onMoreInfo={handleMoreInfo}
                    icon={<Clapperboard className="w-5 h-5 text-white" />}
                    watchlist={watchlist}
                    onToggleWatchlist={handleToggleWatchlist}
                  />
                  <MediaRow
                    title="ANIMATED & ANIME"
                    items={animeShows}
                    onPlay={handlePlayMedia}
                    onMoreInfo={handleMoreInfo}
                    icon={<Flame className="w-5 h-5 text-white" />}
                    watchlist={watchlist}
                    onToggleWatchlist={handleToggleWatchlist}
                  />
                </div>
              </>
            )}

            {/* ==================== 3. TV SHOWS HUB TAB ==================== */}
            {activeTab === 'tv' && (
              <div className="space-y-8">
                {/* TV Shows Featured Banner */}
                {topTv.length > 0 && (
                  <HeroBannerDisney
                    items={topTv}
                    onPlay={handlePlayMedia}
                    onMoreInfo={handleMoreInfo}
                    watchlist={watchlist}
                    onToggleWatchlist={handleToggleWatchlist}
                  />
                )}

                <div className="px-4 sm:px-12 space-y-8">
                  {/* Dedicated TV Shows Sub-Header */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase flex items-center gap-3">
                        <Tv2 className="w-7 h-7 text-white" />
                        TV Series Hub
                      </h1>
                      <p className="text-xs sm:text-sm text-zinc-400 mt-1 font-medium">
                        Explore binge-worthy series, dramas, sitcoms, and docuseries
                      </p>
                    </div>

                    {/* TV Category Quick Chips */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {[
                        { id: 'all', label: 'All Series' },
                        { id: 'drama', label: 'Dramas' },
                        { id: 'comedy', label: 'Comedies' },
                        { id: 'scifi', label: 'Sci-Fi & Fantasy' },
                        { id: 'crime', label: 'Crime & Mystery' },
                        { id: 'anime', label: 'Anime' },
                      ].map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setTvGenreFilter(cat.id)}
                          className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                            tvGenreFilter === cat.id
                              ? 'bg-white text-black shadow-lg font-extrabold scale-105'
                              : 'bg-white/5 border border-white/10 text-zinc-300 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Filtered or Full TV Rows */}
                  {tvGenreFilter === 'all' && (
                    <div className="space-y-8">
                      <MediaRow
                        title="BINGE-WORTHY TV SERIES"
                        items={topTv}
                        onPlay={handlePlayMedia}
                        onMoreInfo={handleMoreInfo}
                        icon={<Tv className="w-5 h-5 text-white" />}
                        watchlist={watchlist}
                        onToggleWatchlist={handleToggleWatchlist}
                      />
                      <MediaRow
                        title="HIT DRAMA SERIES"
                        items={tvDramas}
                        onPlay={handlePlayMedia}
                        onMoreInfo={handleMoreInfo}
                        icon={<Star className="w-5 h-5 text-white" />}
                        watchlist={watchlist}
                        onToggleWatchlist={handleToggleWatchlist}
                      />
                      <MediaRow
                        title="SITCOMS & COMEDIES"
                        items={tvComedies}
                        onPlay={handlePlayMedia}
                        onMoreInfo={handleMoreInfo}
                        icon={<Sparkles className="w-5 h-5 text-white" />}
                        watchlist={watchlist}
                        onToggleWatchlist={handleToggleWatchlist}
                      />
                      <MediaRow
                        title="SCI-FI & FANTASY SAGA"
                        items={tvSciFi}
                        onPlay={handlePlayMedia}
                        onMoreInfo={handleMoreInfo}
                        icon={<Zap className="w-5 h-5 text-white" />}
                        watchlist={watchlist}
                        onToggleWatchlist={handleToggleWatchlist}
                      />
                      <MediaRow
                        title="CRIME & MYSTERY"
                        items={tvCrime}
                        onPlay={handlePlayMedia}
                        onMoreInfo={handleMoreInfo}
                        icon={<Clapperboard className="w-5 h-5 text-white" />}
                        watchlist={watchlist}
                        onToggleWatchlist={handleToggleWatchlist}
                      />
                      <MediaRow
                        title="ANIMATED SERIES & ANIME"
                        items={animeShows}
                        onPlay={handlePlayMedia}
                        onMoreInfo={handleMoreInfo}
                        icon={<Flame className="w-5 h-5 text-white" />}
                        watchlist={watchlist}
                        onToggleWatchlist={handleToggleWatchlist}
                      />
                    </div>
                  )}

                  {/* Filtered Category Grid */}
                  {tvGenreFilter !== 'all' && (
                    <div className="pt-2">
                      <h2 className="text-xl font-extrabold uppercase text-white mb-6">
                        {tvGenreFilter.toUpperCase()} TV SHOWS
                      </h2>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 sm:gap-8 pb-16">
                        {(tvGenreFilter === 'drama'
                          ? tvDramas
                          : tvGenreFilter === 'comedy'
                          ? tvComedies
                          : tvGenreFilter === 'scifi'
                          ? tvSciFi
                          : tvGenreFilter === 'crime'
                          ? tvCrime
                          : animeShows
                        ).map((item) => (
                          <MovieCard
                            key={item.id}
                            item={item}
                            fullWidth={true}
                            onPlay={handlePlayMedia}
                            onMoreInfo={handleMoreInfo}
                            isSaved={watchlist.some((w) => w.id === item.id)}
                            onToggleWatchlist={handleToggleWatchlist}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ==================== 4. MOVIES HUB TAB ==================== */}
            {activeTab === 'movie' && (
              <div className="space-y-8">
                {/* Movies Featured Banner */}
                {popularMovies.length > 0 && (
                  <HeroBannerDisney
                    items={popularMovies}
                    onPlay={handlePlayMedia}
                    onMoreInfo={handleMoreInfo}
                    watchlist={watchlist}
                    onToggleWatchlist={handleToggleWatchlist}
                  />
                )}

                <div className="px-4 sm:px-12 space-y-8">
                  {/* Dedicated Movies Sub-Header */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase flex items-center gap-3">
                        <Film className="w-7 h-7 text-white" />
                        Feature Films Hub
                      </h1>
                      <p className="text-xs sm:text-sm text-zinc-400 mt-1 font-medium">
                        Blockbusters, critically acclaimed masterpieces, action, and comedies
                      </p>
                    </div>

                    {/* Movie Category Quick Chips */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {[
                        { id: 'all', label: 'All Movies' },
                        { id: 'action', label: 'Action' },
                        { id: 'top_rated', label: 'Top Rated' },
                        { id: 'scifi', label: 'Sci-Fi' },
                        { id: 'horror', label: 'Horror' },
                        { id: 'comedy', label: 'Comedy' },
                      ].map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setMovieGenreFilter(cat.id)}
                          className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                            movieGenreFilter === cat.id
                              ? 'bg-white text-black shadow-lg font-extrabold scale-105'
                              : 'bg-white/5 border border-white/10 text-zinc-300 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Filtered or Full Movie Rows */}
                  {movieGenreFilter === 'all' && (
                    <div className="space-y-8">
                      <MediaRow
                        title="BLOCKBUSTER MOVIES"
                        items={popularMovies}
                        onPlay={handlePlayMedia}
                        onMoreInfo={handleMoreInfo}
                        icon={<Film className="w-5 h-5 text-white" />}
                        watchlist={watchlist}
                        onToggleWatchlist={handleToggleWatchlist}
                      />
                      <MediaRow
                        title="TOP RATED MASTERPIECES"
                        items={topRatedMovies}
                        onPlay={handlePlayMedia}
                        onMoreInfo={handleMoreInfo}
                        icon={<Star className="w-5 h-5 text-white" />}
                        watchlist={watchlist}
                        onToggleWatchlist={handleToggleWatchlist}
                      />
                      <MediaRow
                        title="BLOCKBUSTER ACTION & ADVENTURE"
                        items={actionMovies}
                        onPlay={handlePlayMedia}
                        onMoreInfo={handleMoreInfo}
                        icon={<Flame className="w-5 h-5 text-white" />}
                        watchlist={watchlist}
                        onToggleWatchlist={handleToggleWatchlist}
                      />
                      <MediaRow
                        title="SCI-FI & FUTURISTIC THRILLERS"
                        items={sciFiMovies}
                        onPlay={handlePlayMedia}
                        onMoreInfo={handleMoreInfo}
                        icon={<Zap className="w-5 h-5 text-white" />}
                        watchlist={watchlist}
                        onToggleWatchlist={handleToggleWatchlist}
                      />
                      <MediaRow
                        title="HORROR & SUSPENSE"
                        items={horrorMovies}
                        onPlay={handlePlayMedia}
                        onMoreInfo={handleMoreInfo}
                        icon={<Clapperboard className="w-5 h-5 text-white" />}
                        watchlist={watchlist}
                        onToggleWatchlist={handleToggleWatchlist}
                      />
                      <MediaRow
                        title="LAUGH-OUT-LOUD COMEDIES"
                        items={comedyMovies}
                        onPlay={handlePlayMedia}
                        onMoreInfo={handleMoreInfo}
                        icon={<Sparkles className="w-5 h-5 text-white" />}
                        watchlist={watchlist}
                        onToggleWatchlist={handleToggleWatchlist}
                      />
                    </div>
                  )}

                  {/* Filtered Category Grid */}
                  {movieGenreFilter !== 'all' && (
                    <div className="pt-2">
                      <h2 className="text-xl font-extrabold uppercase text-white mb-6">
                        {movieGenreFilter.toUpperCase()} MOVIES
                      </h2>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 sm:gap-8 pb-16">
                        {(movieGenreFilter === 'action'
                          ? actionMovies
                          : movieGenreFilter === 'top_rated'
                          ? topRatedMovies
                          : movieGenreFilter === 'scifi'
                          ? sciFiMovies
                          : movieGenreFilter === 'horror'
                          ? horrorMovies
                          : comedyMovies
                        ).map((item) => (
                          <MovieCard
                            key={item.id}
                            item={item}
                            fullWidth={true}
                            onPlay={handlePlayMedia}
                            onMoreInfo={handleMoreInfo}
                            isSaved={watchlist.some((w) => w.id === item.id)}
                            onToggleWatchlist={handleToggleWatchlist}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ==================== 5. MY STUFF (WATCHLIST) TAB ==================== */}
            {activeTab === 'watchlist' && (
              <div className="pt-28 px-6 sm:px-12 max-w-7xl mx-auto space-y-8 min-h-[75vh]">
                {/* Header */}
                <div className="border-b border-white/10 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight uppercase flex items-center gap-3">
                      <Bookmark className="w-8 h-8 text-white fill-white" />
                      My Stuff
                    </h1>
                    <p className="text-sm text-zinc-400 mt-1 font-medium">
                      Your saved movies and TV series library
                    </p>
                  </div>

                  {/* Watchlist Filter Tabs */}
                  <div className="flex items-center gap-2 bg-zinc-900/90 p-1.5 rounded-2xl border border-white/10">
                    <button
                      onClick={() => setWatchlistFilter('all')}
                      className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        watchlistFilter === 'all'
                          ? 'bg-white text-black shadow-md'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      All ({watchlist.length})
                    </button>
                    <button
                      onClick={() => setWatchlistFilter('movie')}
                      className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        watchlistFilter === 'movie'
                          ? 'bg-white text-black shadow-md'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      Movies ({watchlist.filter((i) => (i.media_type || (i.title ? 'movie' : 'tv')) === 'movie').length})
                    </button>
                    <button
                      onClick={() => setWatchlistFilter('tv')}
                      className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        watchlistFilter === 'tv'
                          ? 'bg-white text-black shadow-md'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      TV Shows ({watchlist.filter((i) => (i.media_type || (i.title ? 'movie' : 'tv')) === 'tv').length})
                    </button>
                  </div>
                </div>

                {filteredWatchlist.length === 0 ? (
                  <div className="py-20 px-6 text-center space-y-5 bg-zinc-900/40 rounded-3xl border border-white/10 my-8 max-w-2xl mx-auto flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-zinc-800/80 border border-white/10 flex items-center justify-center text-zinc-400">
                      <Bookmark className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-black text-white">Your Library is Empty</h2>
                    <p className="text-zinc-400 text-sm max-w-md leading-relaxed">
                      You haven't saved any titles here yet. Click "My Stuff" on any movie or TV show to save it to your personal watchlist!
                    </p>
                    <button
                      onClick={() => setActiveTab('home')}
                      className="bg-white hover:bg-zinc-200 text-black font-extrabold text-xs sm:text-sm px-8 py-3 rounded-md transition-all uppercase tracking-wider shadow-lg transform hover:scale-105"
                    >
                      Browse Movies & TV Shows
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 sm:gap-8 pb-20">
                    {filteredWatchlist.map((item) => (
                      <MovieCard
                        key={item.id}
                        item={item}
                        fullWidth={true}
                        onPlay={handlePlayMedia}
                        onMoreInfo={handleMoreInfo}
                        isSaved={true}
                        onToggleWatchlist={handleToggleWatchlist}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* STREAMING PLAYER MODAL */}
      <AnimatePresence>
        {playerMedia && (
          <PlayerModal
            item={playerMedia}
            initialSeason={playerSeason}
            initialEpisode={playerEpisode}
            onClose={() => {
              setPlayerMedia(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* DETAIL MODAL */}
      <AnimatePresence>
        {detailMedia && (
          <DetailModal
            item={detailMedia}
            onClose={() => setDetailMedia(null)}
            onPlay={handlePlayMedia}
            watchlist={watchlist}
            onToggleWatchlist={handleToggleWatchlist}
          />
        )}
      </AnimatePresence>

      {/* Toast Notification Banner */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-zinc-900/95 text-white px-5 py-3.5 rounded-2xl border border-white/20 shadow-2xl backdrop-blur-xl max-w-md"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-xs sm:text-sm font-bold">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="mt-20 border-t border-zinc-800/80 pt-12 pb-8 text-center text-xs text-zinc-500 space-y-3 relative z-10 px-6">
        <div className="font-sans font-black text-2xl text-white tracking-widest uppercase drop-shadow-md">FREEFLIX</div>
        <p>© 2026 FREEFLIX. Stream your favorite movies and TV shows for free.</p>
        <p className="text-[10px] text-zinc-600 max-w-xl mx-auto px-4">
          Disclaimer: FREEFLIX does not host any media files on its servers. All videos are embedded from third-party streaming providers.
        </p>
      </footer>
    </div>
  );
}
