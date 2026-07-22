import React, { useState, useEffect, useRef } from 'react';
import { X, Server, Maximize, Minimize, SkipForward, Tv, Film, Check, AlertCircle, Play, Pause, ChevronDown, Clock, RotateCcw } from 'lucide-react';
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
  const [progressPercentage, setProgressPercentage] = useState<number>(5);
  const [currentTime, setCurrentTime] = useState<number>(0); // in seconds
  const [duration, setDuration] = useState<number>(item.title ? 7200 : 2700); // 2 hrs for movie, 45 mins for TV default
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  const containerRef = useRef<HTMLDivElement>(null);

  const mediaType: MediaType = item.media_type || (item.title ? 'movie' : 'tv');
  const title = item.title || item.name || 'Title';

  // Fetch TV / Movie duration and details from TMDB
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
          if (data.episode_run_time && data.episode_run_time.length > 0) {
            setDuration(data.episode_run_time[0] * 60);
          }
        })
        .catch(() => {});
    } else {
      fetchTMDB(`/movie/${item.id}`)
        .then((data) => {
          if (data.runtime) {
            setDuration(data.runtime * 60);
          }
        })
        .catch(() => {});
    }
  }, [item.id, mediaType, season]);

  // Load previously saved continue watching progress for this exact media/season/episode
  useEffect(() => {
    const uniqueId = mediaType === 'tv' ? `tv-${item.id}` : `movie-${item.id}`;
    const list = getContinueWatchingList();
    const existing = list.find((x) => x.id === uniqueId || (x.tmdbId === item.id && x.mediaType === mediaType));

    if (existing) {
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
      setProgressPercentage(5);
      setCurrentTime(0);
    }
  }, [item.id, mediaType, season, episode]);

  // Document title updates when watching
  useEffect(() => {
    const mediaTitle = item.title || item.name || 'Title';
    if (mediaType === 'tv') {
      document.title = `Watching ${mediaTitle} (S${season}:E${episode}) - FreeNetflix`;
    } else {
      document.title = `Watching ${mediaTitle} - FreeNetflix`;
    }
    return () => {
      document.title = 'FreeNetflix - Stream Movies & TV Shows';
    };
  }, [item, mediaType, season, episode]);

  // Real-time watch heartbeat timer (increments seconds & recalculates percentage while watching)
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentTime((prevTime) => {
        const nextTime = prevTime + 1;
        if (duration > 0) {
          const calculatedPct = Math.min(100, Math.round((nextTime / duration) * 100));
          setProgressPercentage(calculatedPct);
        }
        return nextTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, duration]);

  // Listen to iframe postMessage events (for players like VidSrc / VidEasy / HTML5 embeds)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (data && typeof data === 'object') {
          if (typeof data.currentTime === 'number' && typeof data.duration === 'number' && data.duration > 0) {
            const pct = Math.min(100, Math.round((data.currentTime / data.duration) * 100));
            setCurrentTime(Math.round(data.currentTime));
            setDuration(Math.round(data.duration));
            setProgressPercentage(pct);
          } else if (typeof data.progress === 'number') {
            const pct = Math.min(100, Math.round(data.progress <= 1 ? data.progress * 100 : data.progress));
            setProgressPercentage(pct);
          }
        }
      } catch {}
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

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
    });
    if (onProgressUpdate) onProgressUpdate();
  }, [item, mediaType, season, episode, title, progressPercentage, currentTime, duration, onProgressUpdate]);

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

  // Helper function to format seconds into MM:SS or HH:MM:SS
  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds <= 0) return '0:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) {
      return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    }
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSeekProgress = (newPct: number) => {
    const clampedPct = Math.max(0, Math.min(100, newPct));
    setProgressPercentage(clampedPct);
    if (duration > 0) {
      setCurrentTime(Math.round((clampedPct / 100) * duration));
    }
  };

  const handleAdjustTime = (secondsToAdd: number) => {
    const newTime = Math.max(0, Math.min(duration, currentTime + secondsToAdd));
    setCurrentTime(newTime);
    if (duration > 0) {
      setProgressPercentage(Math.min(100, Math.round((newTime / duration) * 100)));
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

      {/* Interactive Watch Progress & Sync Bar */}
      <div
        className={`w-full px-4 sm:px-8 py-2.5 bg-zinc-950/90 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 z-30 border-t border-white/10 transition-opacity duration-300 ${
          isFullscreen && selectedServer.id === 'zxcstream' ? 'opacity-0 hover:opacity-100' : 'opacity-100'
        }`}
      >
        {/* Left: Play/Pause timer & time display */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1.5 rounded-full bg-zinc-800 hover:bg-[#E50914] text-white transition-colors"
            title={isPlaying ? 'Pause Timer Tracking' : 'Resume Timer Tracking'}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
          </button>

          <div className="flex items-center gap-2 text-xs font-mono font-bold text-gray-200">
            <Clock className="w-3.5 h-3.5 text-[#E50914]" />
            <span>{formatTime(currentTime)}</span>
            <span className="text-gray-500">/</span>
            <span className="text-gray-400">{formatTime(duration)}</span>
          </div>

          <span className="text-xs font-black text-red-400 bg-red-950/80 px-2 py-0.5 rounded border border-red-800/40">
            {progressPercentage}% Watched
          </span>
        </div>

        {/* Center: Interactive Scrubber Slider */}
        <div className="flex-1 max-w-xl mx-2 flex items-center gap-3">
          <input
            type="range"
            min="0"
            max="100"
            value={progressPercentage}
            onChange={(e) => handleSeekProgress(Number(e.target.value))}
            className="w-full h-2 bg-zinc-800 accent-[#E50914] rounded-lg cursor-pointer transition-all"
            title="Drag slider to set where you paused on any server"
          />
        </div>

        {/* Right: Quick position adjusters (-5m, +5m) */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleAdjustTime(-300)}
            className="px-2 py-1 bg-zinc-900 border border-zinc-700 hover:border-red-600 text-gray-300 hover:text-white rounded text-[11px] font-bold transition-all"
            title="Rewind 5 minutes"
          >
            -5m
          </button>
          <button
            onClick={() => handleAdjustTime(-60)}
            className="px-2 py-1 bg-zinc-900 border border-zinc-700 hover:border-red-600 text-gray-300 hover:text-white rounded text-[11px] font-bold transition-all"
            title="Rewind 1 minute"
          >
            -1m
          </button>
          <button
            onClick={() => handleAdjustTime(60)}
            className="px-2 py-1 bg-zinc-900 border border-zinc-700 hover:border-red-600 text-gray-300 hover:text-white rounded text-[11px] font-bold transition-all"
            title="Forward 1 minute"
          >
            +1m
          </button>
          <button
            onClick={() => handleAdjustTime(300)}
            className="px-2 py-1 bg-zinc-900 border border-zinc-700 hover:border-red-600 text-gray-300 hover:text-white rounded text-[11px] font-bold transition-all"
            title="Forward 5 minutes"
          >
            +5m
          </button>
        </div>
      </div>

      {/* Bottom TV Season / Episode Picker & Server Info Bar */}
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
          <span className="text-gray-400 hidden sm:inline">Progress Synced</span>
        </div>
      </div>
    </div>
  );
};
