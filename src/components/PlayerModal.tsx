import React, { useState, useEffect, useRef } from 'react';
import { X, Server, SkipForward, Tv, Film, Check, AlertCircle, Play, Pause, ChevronDown, Clock, RotateCcw } from 'lucide-react';
import { MediaItem, MediaType, ServerOption } from '../types';
import { STREAM_SERVERS, fetchTMDB } from '../services/tmdb';
import { saveContinueWatchingItem, getContinueWatchingList } from '../services/storage';

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
  const [selectedServer, setSelectedServer] = useState<ServerOption>(STREAM_SERVERS[0]); // default server
  const [season, setSeason] = useState<number>(initialSeason);
  const [episode, setEpisode] = useState<number>(initialEpisode);
  const [totalSeasons, setTotalSeasons] = useState<number>(1);
  const [episodesInSeason, setEpisodesInSeason] = useState<number>(24);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showServerMenu, setShowServerMenu] = useState<boolean>(false);

  // Watch Progress & Duration tracking state
  const [progressPercentage, setProgressPercentage] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0); // in seconds
  const [duration, setDuration] = useState<number>(item.title ? 7200 : 2700); // 2 hrs for movie, 45 mins for TV default
  const [isPlaying, setIsPlaying] = useState<boolean>(false); // Starts paused until video loads/plays

  const containerRef = useRef<HTMLDivElement>(null);

  const mediaType: MediaType = item.media_type || (item.title ? 'movie' : 'tv');
  const title = item.title || item.name || 'Title';

  // Fetch TV / Movie duration and details from TMDB (exact runtime for movies & TV episodes)
  useEffect(() => {
    if (mediaType === 'tv') {
      // 1. Fetch TV show main details
      fetchTMDB(`/tv/${item.id}`)
        .then((data) => {
          if (data.number_of_seasons) {
            setTotalSeasons(data.number_of_seasons);
          }
          const s = data.seasons?.find((x: { season_number: number }) => x.season_number === season);
          if (s?.episode_count) {
            setEpisodesInSeason(s.episode_count);
          }
          if (data.episode_run_time && data.episode_run_time.length > 0) {
            setDuration(data.episode_run_time[0] * 60);
          }
        })
        .catch(() => {});

      // 2. Fetch specific episode runtime details
      fetchTMDB(`/tv/${item.id}/season/${season}/episode/${episode}`)
        .then((epData) => {
          if (epData && typeof epData.runtime === 'number' && epData.runtime > 0) {
            setDuration(epData.runtime * 60);
          }
        })
        .catch(() => {});
    } else {
      // Fetch movie runtime details
      fetchTMDB(`/movie/${item.id}`)
        .then((data) => {
          if (data && typeof data.runtime === 'number' && data.runtime > 0) {
            setDuration(data.runtime * 60);
          }
        })
        .catch(() => {});
    }
  }, [item.id, mediaType, season, episode]);

  // Load previously saved continue watching progress & server choice for this exact item
  useEffect(() => {
    const uniqueId = mediaType === 'tv' ? `tv-${item.id}` : `movie-${item.id}`;
    const list = getContinueWatchingList();
    const existing = list.find((x) => x.id === uniqueId || (x.tmdbId === item.id && x.mediaType === mediaType));

    if (existing) {
      if (existing.serverId) {
        const savedServer = STREAM_SERVERS.find((s) => s.id === existing.serverId);
        if (savedServer) {
          setSelectedServer(savedServer);
        }
      }
      if (existing.progressPercentage !== undefined) {
        setProgressPercentage(existing.progressPercentage);
      }
      if (existing.currentTime !== undefined) {
        setCurrentTime(existing.currentTime);
      } else if (existing.progressPercentage && duration) {
        setCurrentTime(Math.round((existing.progressPercentage / 100) * duration));
      }
      if (existing.duration) {
        setDuration(existing.duration);
      }
    } else {
      setProgressPercentage(0);
      setCurrentTime(0);
    }
  }, [item.id, mediaType, season, episode]);

  // Document title updates when watching
  useEffect(() => {
    const mediaTitle = item.title || item.name || 'Title';
    if (mediaType === 'tv') {
      document.title = `Watching ${mediaTitle} (S${season}:E${episode}) - FREEFLIX`;
    } else {
      document.title = `Watching ${mediaTitle} - FREEFLIX`;
    }
    return () => {
      document.title = 'FREEFLIX - Stream Movies & TV Shows';
    };
  }, [item, mediaType, season, episode]);

  // Handle tab close / refresh / page cut / unmount ("if you cut make it listen to that")
  useEffect(() => {
    const handleSaveState = () => {
      const uniqueId = mediaType === 'tv' ? `tv-${item.id}` : `movie-${item.id}`;
      saveContinueWatchingItem({
        id: uniqueId,
        tmdbId: item.id,
        mediaType,
        title,
        posterPath: item.poster_path,
        backdropPath: item.backdrop_path,
        progressPercentage,
        currentTime,
        duration,
        season: mediaType === 'tv' ? season : undefined,
        episode: mediaType === 'tv' ? episode : undefined,
        certification: item.certification,
        voteAverage: item.vote_average,
        completed: progressPercentage >= 95,
        serverId: selectedServer.id,
      });
    };

    window.addEventListener('beforeunload', handleSaveState);
    window.addEventListener('pagehide', handleSaveState);

    return () => {
      handleSaveState(); // Save state on component unmount / modal close
      window.removeEventListener('beforeunload', handleSaveState);
      window.removeEventListener('pagehide', handleSaveState);
    };
  }, [item, mediaType, season, episode, title, progressPercentage, currentTime, duration, selectedServer.id]);

  // Comprehensive listener for iframe duration / time update & fullscreen events across all servers (SuperEmbed, ZXCStream, VidSrc, VidEasy, etc.)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        const raw = event.data;
        const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
        if (!data || typeof data !== 'object') return;

        // Check for player state events (play/pause/playing/ended/fullscreen)
        const eventType = (data.event || data.type || data.status || '').toString().toLowerCase();
        if (eventType.includes('play') || eventType.includes('start')) {
          setIsPlaying(true);
        } else if (eventType.includes('pause') || eventType.includes('stop') || eventType.includes('end')) {
          setIsPlaying(false);
        } else if (eventType.includes('fullscreen') || eventType.includes('requestfullscreen') || eventType.includes('enterfullscreen')) {
          if (containerRef.current) {
            if (containerRef.current.requestFullscreen) {
              containerRef.current.requestFullscreen().catch(() => {});
            } else if ((containerRef.current as any).webkitRequestFullscreen) {
              (containerRef.current as any).webkitRequestFullscreen();
            }
          }
        }

        // Extract nested payload if present
        const payload = data.data || data.payload || data;

        // Parse current time, duration or progress percentage from standard player formats
        const cur = payload.currentTime ?? payload.time ?? payload.seconds ?? payload.position ?? payload.secondsWatched;
        const dur = payload.duration ?? payload.totalDuration ?? payload.length;
        const pct = payload.progress ?? payload.percentage ?? payload.percent;

        if (typeof cur === 'number' && typeof dur === 'number' && dur > 0) {
          const calculatedPct = Math.min(100, Math.max(0, Math.round((cur / dur) * 100)));
          setCurrentTime(Math.round(cur));
          setDuration(Math.round(dur));
          setProgressPercentage(calculatedPct);
          setIsPlaying(true); // Active time update received from player
        } else if (typeof pct === 'number' && pct > 0) {
          const normalizedPct = Math.min(100, Math.max(0, Math.round(pct <= 1 ? pct * 100 : pct)));
          setProgressPercentage(normalizedPct);
          if (duration > 0) {
            setCurrentTime(Math.round((normalizedPct / 100) * duration));
          }
          setIsPlaying(true);
        }
      } catch {}
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [duration]);

  // Save updated progress to local storage and notify parent component
  useEffect(() => {
    const uniqueId = mediaType === 'tv' ? `tv-${item.id}` : `movie-${item.id}`;
    saveContinueWatchingItem({
      id: uniqueId,
      tmdbId: item.id,
      mediaType,
      title,
      posterPath: item.poster_path,
      backdropPath: item.backdrop_path,
      progressPercentage,
      currentTime,
      duration,
      season: mediaType === 'tv' ? season : undefined,
      episode: mediaType === 'tv' ? episode : undefined,
      certification: item.certification,
      voteAverage: item.vote_average,
      completed: progressPercentage >= 95,
      serverId: selectedServer.id,
    });
    if (onProgressUpdate) onProgressUpdate();
  }, [item, mediaType, season, episode, title, progressPercentage, currentTime, duration, selectedServer.id, onProgressUpdate]);

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
      <div className="w-full px-4 sm:px-8 py-4 bg-gradient-to-b from-black via-black/80 to-transparent flex items-center justify-between z-30">
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
                FREEFLIX Player
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

        {/* Right Server Picker */}
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
        </div>
      </div>

      {/* Video Player Frame Container */}
      <div ref={containerRef} className="relative flex-1 w-full bg-black flex items-center justify-center overflow-hidden">
        <iframe
          src={currentEmbedUrl}
          title={title}
          className="w-full h-full border-0 absolute inset-0"
          allow="autoplay *; fullscreen *; encrypted-media *; picture-in-picture *; accelerometer *; gyroscope *; clipboard-write *; web-share *"
          allowFullScreen={true}
          // @ts-ignore
          webkitallowfullscreen="true"
          // @ts-ignore
          mozallowfullscreen="true"
        />
      </div>

      {/* Bottom TV Season / Episode Picker & Server Info Bar */}
      <div className="w-full px-4 sm:px-8 py-3 bg-gradient-to-t from-black via-black/90 to-transparent flex flex-wrap items-center justify-between gap-3 z-30 border-t border-white/5">
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
          <span className="text-gray-400 hidden sm:inline">Progress Synced</span>
        </div>
      </div>
    </div>
  );
};
