import React, { useState, useEffect, useRef } from 'react';
import { X, Server, Maximize, Minimize, SkipForward, Tv, Film, Check, AlertCircle, Play, ChevronDown } from 'lucide-react';
import { MediaItem, MediaType, ServerOption } from '../types';
import { STREAM_SERVERS, fetchTMDB } from '../services/tmdb';
import { saveContinueWatchingItem } from '../services/storage';

interface PlayerModalProps {
  item: MediaItem;
  initialSeason?: number;
  initialEpisode?: number;
  onClose: () => void;
  onProgressUpdate?: () => void;
}

export const PlayerModal: React.FC<PlayerModalProps> = ({
  item,
  initialSeason = 1,
  initialEpisode = 1,
  onClose,
  onProgressUpdate,
}) => {
  const [selectedServer, setSelectedServer] = useState<ServerOption>(STREAM_SERVERS[0]); // default to 2Embed
  const [season, setSeason] = useState<number>(initialSeason);
  const [episode, setEpisode] = useState<number>(initialEpisode);
  const [totalSeasons, setTotalSeasons] = useState<number>(1);
  const [episodesInSeason, setEpisodesInSeason] = useState<number>(24);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showServerMenu, setShowServerMenu] = useState<boolean>(false);
  const [autoNextCountdown, setAutoNextCountdown] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const mediaType: MediaType = item.media_type || (item.title ? 'movie' : 'tv');
  const title = item.title || item.name || 'Title';

  // Fetch TV show details for seasons and episode count if TV show
  useEffect(() => {
    if (mediaType === 'tv') {
      fetchTMDB(`/tv/${item.id}`)
        .then((data) => {
          if (data.number_of_seasons) {
            setTotalSeasons(data.number_of_seasons);
          }
          const s = data.seasons?.find((x: { season_number: number }) => x.season_number === season);
          if (s?.episode_count) {
            setEpisodesInSeason(s.episode_count);
          }
        })
        .catch(() => {});
    }
  }, [item.id, mediaType, season]);

  // Save progress in local storage when opening or changing episode
  useEffect(() => {
    const uniqueId = mediaType === 'tv' ? `tv-${item.id}` : `movie-${item.id}`;
    saveContinueWatchingItem({
      id: uniqueId,
      tmdbId: item.id,
      mediaType,
      title,
      posterPath: item.poster_path,
      backdropPath: item.backdrop_path,
      progressPercentage: 50, // default half watched or active
      season: mediaType === 'tv' ? season : undefined,
      episode: mediaType === 'tv' ? episode : undefined,
      certification: item.certification,
      voteAverage: item.vote_average,
      completed: false,
    });
    if (onProgressUpdate) onProgressUpdate();
  }, [item, mediaType, season, episode, title, onProgressUpdate]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Handle ESC key or Fullscreen trigger
  const toggleFullScreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error('Fullscreen request failed:', err);
      });
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const currentEmbedUrl = selectedServer.getUrl(item.id, mediaType, season, episode);

  const handleNextEpisode = () => {
    if (episode < episodesInSeason) {
      setEpisode(episode + 1);
    } else if (season < totalSeasons) {
      setSeason(season + 1);
      setEpisode(1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col justify-between animate-fade-in">
      {/* Top Navigation Bar */}
      <div
        className={`w-full px-4 sm:px-8 py-4 bg-gradient-to-b from-black via-black/80 to-transparent flex items-center justify-between z-30 transition-opacity duration-300 ${
          isFullscreen && selectedServer.id === 'zxcstream' ? 'opacity-0 hover:opacity-100' : 'opacity-100'
        }`}
      >
        {/* Left Title & Season/Episode details */}
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-zinc-800/80 text-white hover:bg-[#E50914] transition-all"
            title="Close player"
          >
            <X className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-extrabold text-[#E50914] bg-red-950/60 border border-red-800/40 px-2 py-0.5 rounded">
                FreeNetflix Player
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white line-clamp-1">
                {title}
              </h2>
            </div>
            {mediaType === 'tv' && (
              <p className="text-xs text-gray-400 font-medium">
                Season {season}, Episode {episode}
              </p>
            )}
          </div>
        </div>

        {/* Right Server Picker & Custom Fullscreen Controls */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Server Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowServerMenu(!showServerMenu)}
              className="flex items-center gap-2 bg-zinc-900 border border-red-600/40 hover:border-red-600 text-white px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold shadow-lg transition-all"
            >
              <Server className="w-4 h-4 text-[#E50914]" />
              <span className="hidden sm:inline">{selectedServer.name}</span>
              <span className="sm:hidden">{selectedServer.id.toUpperCase()}</span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            {showServerMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl z-50 p-2 space-y-1 max-h-80 overflow-y-auto">
                <div className="text-[10px] font-bold uppercase text-gray-400 px-2 py-1">
                  Select Streaming Server ({STREAM_SERVERS.length})
                </div>
                {STREAM_SERVERS.map((server) => {
                  const isSelected = server.id === selectedServer.id;
                  return (
                    <button
                      key={server.id}
                      onClick={() => {
                        setSelectedServer(server);
                        setShowServerMenu(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-left transition-colors ${
                        isSelected
                          ? 'bg-[#E50914] text-white'
                          : 'text-gray-200 hover:bg-zinc-800 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{server.name}</span>
                        {server.badge && (
                          <span className="text-[9px] bg-black/40 px-1.5 py-0.5 rounded font-black text-yellow-400">
                            {server.badge}
                          </span>
                        )}
                      </div>
                      {isSelected && <Check className="w-4 h-4" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Dedicated Fullscreen Button for ZXCSTREAM (and support all) */}
          {selectedServer.id === 'zxcstream' && (
            <button
              onClick={toggleFullScreen}
              className={`flex items-center gap-1.5 bg-[#E50914] hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs sm:text-sm font-black shadow-xl transition-all transform hover:scale-105 ${
                isFullscreen ? 'hidden' : 'block'
              }`}
              title="Click for Built-in Full Screen (ZXCStream)"
            >
              <Maximize className="w-4 h-4" />
              <span>Full Screen</span>
            </button>
          )}

          {/* Regular Fullscreen toggle for other servers */}
          {selectedServer.id !== 'zxcstream' && (
            <button
              onClick={toggleFullScreen}
              className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white transition-colors"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          )}
        </div>
      </div>

      {/* Video Player Frame Container */}
      <div ref={containerRef} className="relative flex-1 w-full bg-black flex items-center justify-center overflow-hidden">
        {/* NO SANDBOX ATTRIBUTE AT ALL AS REQUESTED (DISABLE SANDBOX AT ANY COST) */}
        <iframe
          src={currentEmbedUrl}
          title={title}
          className="w-full h-full border-0 absolute inset-0"
          allow="fullscreen; autoplay; encrypted-media; picture-in-picture; accelerometer; gyroscope"
          allowFullScreen
        />

        {/* Floating Fullscreen button inside container if ZXCSTREAM and not full yet */}
        {selectedServer.id === 'zxcstream' && !isFullscreen && (
          <button
            onClick={toggleFullScreen}
            className="absolute bottom-6 right-6 z-40 bg-[#E50914] text-white font-black text-xs px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 hover:scale-110 transition-transform"
          >
            <Maximize className="w-4 h-4" />
            Built-in Full Screen (ZXCStream)
          </button>
        )}
      </div>

      {/* Bottom TV Season / Episode Picker & Next Episode Controls */}
      <div
        className={`w-full px-4 sm:px-8 py-3 bg-gradient-to-t from-black via-black/90 to-transparent flex flex-wrap items-center justify-between gap-3 z-30 border-t border-white/5 transition-opacity duration-300 ${
          isFullscreen && selectedServer.id === 'zxcstream' ? 'opacity-0 hover:opacity-100' : 'opacity-100'
        }`}
      >
        <div className="flex items-center gap-3">
          {mediaType === 'tv' && (
            <>
              {/* Season Select */}
              <div className="flex items-center gap-1.5 text-xs text-gray-300 font-semibold">
                <span>Season:</span>
                <select
                  value={season}
                  onChange={(e) => {
                    setSeason(Number(e.target.value));
                    setEpisode(1);
                  }}
                  className="bg-zinc-900 border border-zinc-700 text-white rounded px-2 py-1 text-xs focus:outline-none focus:border-red-600"
                >
                  {Array.from({ length: totalSeasons }, (_, i) => i + 1).map((s) => (
                    <option key={s} value={s}>
                      Season {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Episode Select */}
              <div className="flex items-center gap-1.5 text-xs text-gray-300 font-semibold">
                <span>Episode:</span>
                <select
                  value={episode}
                  onChange={(e) => setEpisode(Number(e.target.value))}
                  className="bg-zinc-900 border border-zinc-700 text-white rounded px-2 py-1 text-xs focus:outline-none focus:border-red-600"
                >
                  {Array.from({ length: episodesInSeason }, (_, i) => i + 1).map((eNum) => (
                    <option key={eNum} value={eNum}>
                      Episode {eNum}
                    </option>
                  ))}
                </select>
              </div>

              {/* Next Episode Button */}
              <button
                onClick={handleNextEpisode}
                className="flex items-center gap-1.5 bg-[#E50914] hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded transition-all shadow-md"
              >
                <SkipForward className="w-3.5 h-3.5" />
                <span>Next Episode</span>
              </button>
            </>
          )}
        </div>

        {/* Info & Status Badge */}
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-ping"></span>
          <span>Server Active: <strong className="text-white">{selectedServer.name}</strong></span>
          <span className="text-zinc-600">|</span>
          <span className="text-gray-400 hidden sm:inline">No Sandbox Enforced</span>
        </div>
      </div>
    </div>
  );
};
