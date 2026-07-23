import React, { useState, useEffect, useCallback } from 'react';
import { Film, Tv, TrendingUp, Sparkles, Flame, Clapperboard, Clock, ShieldAlert } from 'lucide-react';
import { MediaItem, ContinueWatchingItem, MediaType } from './types';
import { STREAMING_PROVIDERS, fetchTMDB } from './services/tmdb';
import {
  getContinueWatchingList,
  removeContinueWatchingItem,
  toggleCompletedStatus,
  clearAllContinueWatching,
} from './services/storage';

import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { MyListSpotlight } from './components/MyListSpotlight';
import { StreamingProvidersBar } from './components/StreamingProvidersBar';
import { GenreNavigationBar, GenreOption } from './components/GenreNavigationBar';
import { MediaRow } from './components/MediaRow';
import { MovieCard } from './components/MovieCard';
import { ContinueWatchingRow } from './components/ContinueWatchingRow';
import { PlayerModal } from './components/PlayerModal';
import { DetailModal } from './components/DetailModal';

export default function App() {
  const [activeCategory, setActiveCategory] = useState<string>('home');
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Rows state
  const [heroItem, setHeroItem] = useState<MediaItem | null>(null);
  const [trending, setTrending] = useState<MediaItem[]>([]);
  const [popularMovies, setPopularMovies] = useState<MediaItem[]>([]);
  const [topTv, setTopTv] = useState<MediaItem[]>([]);
  const [providerMovies, setProviderMovies] = useState<MediaItem[]>([]);
  const [actionMovies, setActionMovies] = useState<MediaItem[]>([]);
  const [animeShows, setAnimeShows] = useState<MediaItem[]>([]);
  const [searchResults, setSearchResults] = useState<MediaItem[]>([]);

  // Search filtering state
  const [searchTypeFilter, setSearchTypeFilter] = useState<'all' | 'movie' | 'tv'>('all');

  // Genre filtering state
  const [selectedGenreOption, setSelectedGenreOption] = useState<GenreOption | null>(null);
  const [genreMovies, setGenreMovies] = useState<MediaItem[]>([]);
  const [genreTvShows, setGenreTvShows] = useState<MediaItem[]>([]);

  // Continue Watching state
  const [continueWatching, setContinueWatching] = useState<ContinueWatchingItem[]>([]);

  // Modals state
  const [playerMedia, setPlayerMedia] = useState<MediaItem | null>(null);
  const [playerSeason, setPlayerSeason] = useState<number>(1);
  const [playerEpisode, setPlayerEpisode] = useState<number>(1);
  const [detailMedia, setDetailMedia] = useState<MediaItem | null>(null);

  // Refresh continue watching
  const refreshContinueWatching = useCallback(() => {
    setContinueWatching(getContinueWatchingList());
  }, []);

  useEffect(() => {
    refreshContinueWatching();
  }, [refreshContinueWatching]);

  // Initial Content Fetching
  useEffect(() => {
    async function loadData() {
      try {
        // Trending
        const trendingData = await fetchTMDB('/trending/all/week');
        const trendingResults: MediaItem[] = trendingData.results || [];
        setTrending(trendingResults);

        // Featured Hero Item
        if (trendingResults.length > 0) {
          setHeroItem(trendingResults[0]);
        }

        // Popular Movies
        const moviesData = await fetchTMDB('/movie/popular');
        setPopularMovies(
          (moviesData.results || []).map((m: MediaItem) => ({ ...m, media_type: 'movie' as MediaType }))
        );

        // Top TV
        const tvData = await fetchTMDB('/tv/popular');
        setTopTv(
          (tvData.results || []).map((t: MediaItem) => ({ ...t, media_type: 'tv' as MediaType }))
        );

        // Action Genre (Genre 28)
        const actionData = await fetchTMDB('/discover/movie', { with_genres: '28' });
        setActionMovies(
          (actionData.results || []).map((m: MediaItem) => ({ ...m, media_type: 'movie' as MediaType }))
        );

        // Animation / Anime Genre (Genre 16)
        const animeData = await fetchTMDB('/discover/tv', { with_genres: '16' });
        setAnimeShows(
          (animeData.results || []).map((a: MediaItem) => ({ ...a, media_type: 'tv' as MediaType }))
        );
      } catch (err) {
        console.error('Error fetching initial TMDB data:', err);
      }
    }
    loadData();
  }, []);

  // Fetch when Provider selected
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

  // Handlers for playing
  const handlePlayMedia = (item: MediaItem, season: number = 1, episode: number = 1) => {
    setPlayerMedia(item);
    setPlayerSeason(season);
    setPlayerEpisode(episode);
  };

  const handleMoreInfo = (item: MediaItem) => {
    setDetailMedia(item);
  };

  const handleDeleteContinueWatching = (id: string) => {
    removeContinueWatchingItem(id);
    refreshContinueWatching();
  };

  const handleToggleComplete = (id: string) => {
    toggleCompletedStatus(id);
    refreshContinueWatching();
  };

  const handleClearAllContinueWatching = () => {
    clearAllContinueWatching();
    refreshContinueWatching();
  };

  const selectedProviderName = STREAMING_PROVIDERS.find((p) => p.id === selectedProviderId)?.name;

  return (
    <div className="min-h-screen bg-[#141414] text-white font-sans antialiased pb-20 selection:bg-[#E50914]">
      {/* Header Navbar */}
      <Navbar
        onSearch={setSearchQuery}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        onResetFilters={() => {
          setSelectedProviderId(null);
          setSelectedGenreOption(null);
        }}
      />

      {/* Main Content Area */}
      <main className="relative z-10">
        {/* Search Results View */}
        {searchQuery.trim() ? (
          <div className="pt-28 px-4 sm:px-8 max-w-7xl mx-auto space-y-8">
            {/* Search Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    Search Results for <span className="text-[#E50914]">"{searchQuery}"</span>
                  </h1>
                  <span className="bg-red-950/60 text-red-400 border border-red-800/50 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                    {searchResults.length} {searchResults.length === 1 ? 'Title' : 'Titles'}
                  </span>
                </div>
                <p className="text-zinc-400 text-xs sm:text-sm mt-1">
                  Explore titles matching your search query.
                </p>
              </div>

              {/* Filter Tabs for Search */}
              <div className="flex items-center gap-2 bg-zinc-900/90 p-1.5 rounded-2xl border border-zinc-800 self-start sm:self-auto">
                <button
                  onClick={() => setSearchTypeFilter('all')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    searchTypeFilter === 'all'
                      ? 'bg-[#E50914] text-white shadow-lg shadow-red-900/30'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  All ({searchResults.length})
                </button>
                <button
                  onClick={() => setSearchTypeFilter('movie')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    searchTypeFilter === 'movie'
                      ? 'bg-[#E50914] text-white shadow-lg shadow-red-900/30'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Movies ({searchResults.filter((i) => (i.media_type || (i.title ? 'movie' : 'tv')) === 'movie').length})
                </button>
                <button
                  onClick={() => setSearchTypeFilter('tv')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    searchTypeFilter === 'tv'
                      ? 'bg-[#E50914] text-white shadow-lg shadow-red-900/30'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  TV Shows ({searchResults.filter((i) => (i.media_type || (i.title ? 'movie' : 'tv')) === 'tv').length})
                </button>
              </div>
            </div>

            {searchResults.length === 0 ? (
              <div className="py-20 text-center space-y-3 bg-zinc-900/30 rounded-3xl border border-zinc-800/50 my-6">
                <p className="text-zinc-400 text-base font-medium">
                  No titles found matching <span className="text-white font-bold">"{searchQuery}"</span>.
                </p>
                <p className="text-zinc-500 text-xs">
                  Try searching for another movie, TV show, actor, or genre.
                </p>
              </div>
            ) : (
              (() => {
                const displayed = searchResults.filter((item) => {
                  if (searchTypeFilter === 'all') return true;
                  const type = item.media_type || (item.title ? 'movie' : 'tv');
                  return type === searchTypeFilter;
                });

                if (displayed.length === 0) {
                  return (
                    <div className="py-16 text-center space-y-2 bg-zinc-900/30 rounded-3xl border border-zinc-800/50">
                      <p className="text-zinc-400 text-sm">
                        No {searchTypeFilter === 'movie' ? 'movies' : 'TV shows'} found for "{searchQuery}".
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 sm:gap-8 lg:gap-10 pb-20">
                    {displayed.map((item) => (
                      <MovieCard
                        key={item.id}
                        item={item}
                        fullWidth={true}
                        onPlay={handlePlayMedia}
                        onMoreInfo={handleMoreInfo}
                      />
                    ))}
                  </div>
                );
              })()
            )}
          </div>
        ) : (
          <>
            {/* Spotlight Featured Section matching image */}
            {activeCategory === 'home' && trending.length > 0 && (
              <MyListSpotlight
                items={trending}
                onPlay={handlePlayMedia}
                onMoreInfo={handleMoreInfo}
              />
            )}

            {/* CONTINUE WATCHING ROW DIRECTLY BELOW MY LIST */}
            <ContinueWatchingRow
              items={continueWatching}
              onPlay={handlePlayMedia}
              onDeleteItem={handleDeleteContinueWatching}
              onToggleComplete={handleToggleComplete}
              onClearAll={handleClearAllContinueWatching}
            />

            {/* STREAMING PROVIDERS FILTER BAR IN MIDDLE OF HOME SCREEN */}
            <StreamingProvidersBar
              selectedProviderId={selectedProviderId}
              onSelectProvider={setSelectedProviderId}
            />

            {/* GENRE NAVIGATION BAR BELOW STREAMING PROVIDERS BAR */}
            <GenreNavigationBar
              selectedGenreId={selectedGenreOption?.id ?? null}
              onSelectGenre={(genre) => {
                if (genre.id === null) {
                  setSelectedGenreOption(null);
                } else {
                  setSelectedGenreOption(genre);
                }
              }}
            />

            {/* GENRE FILTERED ROWS */}
            {selectedGenreOption && selectedGenreOption.id !== null && (
              <div className="space-y-4 my-4">
                {genreMovies.length > 0 && (
                  <MediaRow
                    title={`${selectedGenreOption.name} Movies`}
                    items={genreMovies}
                    onPlay={handlePlayMedia}
                    onMoreInfo={handleMoreInfo}
                    icon={selectedGenreOption.icon}
                  />
                )}
                {genreTvShows.length > 0 && (
                  <MediaRow
                    title={`${selectedGenreOption.name} TV Shows & Series`}
                    items={genreTvShows}
                    onPlay={handlePlayMedia}
                    onMoreInfo={handleMoreInfo}
                    icon={selectedGenreOption.icon}
                  />
                )}
              </div>
            )}

            {/* PROVIDER FILTERED ROW */}
            {selectedProviderId && providerMovies.length > 0 && (
              <MediaRow
                title={`Top Titles on ${selectedProviderName}`}
                items={providerMovies}
                onPlay={handlePlayMedia}
                onMoreInfo={handleMoreInfo}
                icon={<Sparkles className="w-6 h-6 text-[#E50914]" />}
              />
            )}

            {/* CATEGORY & GENRE ROWS */}
            {activeCategory === 'home' && (
              <>
                <MediaRow
                  title="Trending Now"
                  items={trending}
                  onPlay={handlePlayMedia}
                  onMoreInfo={handleMoreInfo}
                  icon={<Flame className="w-6 h-6 text-[#E50914]" />}
                />
                <MediaRow
                  title="Popular Movies"
                  items={popularMovies}
                  onPlay={handlePlayMedia}
                  onMoreInfo={handleMoreInfo}
                  icon={<Film className="w-6 h-6 text-[#E50914]" />}
                />
                <MediaRow
                  title="Top TV Series"
                  items={topTv}
                  onPlay={handlePlayMedia}
                  onMoreInfo={handleMoreInfo}
                  icon={<Tv className="w-6 h-6 text-[#E50914]" />}
                />
                <MediaRow
                  title="Action & Blockbusters"
                  items={actionMovies}
                  onPlay={handlePlayMedia}
                  onMoreInfo={handleMoreInfo}
                  icon={<Clapperboard className="w-6 h-6 text-[#E50914]" />}
                />
                <MediaRow
                  title="Anime & Animation"
                  items={animeShows}
                  onPlay={handlePlayMedia}
                  onMoreInfo={handleMoreInfo}
                  icon={<Sparkles className="w-6 h-6 text-[#E50914]" />}
                />
              </>
            )}

            {activeCategory === 'movie' && (
              <>
                <MediaRow
                  title="Popular Movies"
                  items={popularMovies}
                  onPlay={handlePlayMedia}
                  onMoreInfo={handleMoreInfo}
                  icon={<Film className="w-6 h-6 text-[#E50914]" />}
                />
                <MediaRow
                  title="Action Thrillers"
                  items={actionMovies}
                  onPlay={handlePlayMedia}
                  onMoreInfo={handleMoreInfo}
                  icon={<Flame className="w-6 h-6 text-[#E50914]" />}
                />
              </>
            )}

            {activeCategory === 'tv' && (
              <>
                <MediaRow
                  title="Top TV Series"
                  items={topTv}
                  onPlay={handlePlayMedia}
                  onMoreInfo={handleMoreInfo}
                  icon={<Tv className="w-6 h-6 text-[#E50914]" />}
                />
                <MediaRow
                  title="Anime & Animated Hits"
                  items={animeShows}
                  onPlay={handlePlayMedia}
                  onMoreInfo={handleMoreInfo}
                  icon={<Sparkles className="w-6 h-6 text-[#E50914]" />}
                />
              </>
            )}

            {activeCategory === 'trending' && (
              <MediaRow
                title="Weekly Top Trending"
                items={trending}
                onPlay={handlePlayMedia}
                onMoreInfo={handleMoreInfo}
                icon={<TrendingUp className="w-6 h-6 text-[#E50914]" />}
              />
            )}
          </>
        )}
      </main>

      {/* STREAMING PLAYER MODAL */}
      {playerMedia && (
        <PlayerModal
          item={playerMedia}
          initialSeason={playerSeason}
          initialEpisode={playerEpisode}
          onClose={() => {
            setPlayerMedia(null);
            refreshContinueWatching();
          }}
          onProgressUpdate={refreshContinueWatching}
        />
      )}

      {/* DETAIL MODAL */}
      {detailMedia && (
        <DetailModal
          item={detailMedia}
          onClose={() => setDetailMedia(null)}
          onPlay={handlePlayMedia}
        />
      )}

      {/* Footer */}
      <footer className="mt-20 border-t border-zinc-800 pt-12 pb-8 text-center text-xs text-gray-500 space-y-3">
        <div className="font-sans font-black text-2xl text-[#E50914] tracking-widest drop-shadow-[0_2px_8px_rgba(229,9,20,0.5)]">FREEFLIX</div>
        <p>© 2026 FREEFLIX. Stream your favorite movies and TV shows for free.</p>
        <p className="text-[10px] text-gray-600 max-w-xl mx-auto px-4">
          Disclaimer: FREEFLIX does not host any media files on its servers. All videos are embedded from third-party streaming providers.
        </p>
      </footer>
    </div>
  );
}
