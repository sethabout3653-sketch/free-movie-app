import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  X,
  Server,
  SkipForward,
  Check,
  ChevronDown,
  Clock,
  RotateCcw,
  Tv,
  Film,
  Play,
  Pause,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { MediaItem, MediaType, ServerOption } from "../types";
import { STREAM_SERVERS, fetchTMDB } from "../services/tmdb";
import {
  saveContinueWatchingItem,
  getContinueWatchingList,
} from "../services/storage";

interface PlayerModalProps {
  item: MediaItem;
  initialSeason?: number;
  initialEpisode?: number;
  onClose: () => void;
  onProgressUpdate?: () => void;
}

type PlayerMessage = {
  event?: string;
  type?: string;
  status?: string;
  data?: unknown;
  payload?: unknown;
  currentTime?: number;
  time?: number;
  seconds?: number;
  position?: number;
  secondsWatched?: number;
  duration?: number;
  totalDuration?: number;
  length?: number;
  progress?: number;
  percentage?: number;
  percent?: number;
};

export const PlayerModal: React.FC<PlayerModalProps> = ({
  item,
  initialSeason = 1,
  initialEpisode = 1,
  onClose,
  onProgressUpdate,
}) => {
  const mediaType: MediaType = item.media_type || (item.title ? "movie" : "tv");
  const title = item.title || item.name || "Title";

  const [selectedServer, setSelectedServer] = useState<ServerOption>(
    STREAM_SERVERS[0]
  );
  const [season, setSeason] = useState<number>(initialSeason);
  const [episode, setEpisode] = useState<number>(initialEpisode);
  const [totalSeasons, setTotalSeasons] = useState<number>(1);
  const [episodesInSeason, setEpisodesInSeason] = useState<number>(24);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showServerMenu, setShowServerMenu] = useState<boolean>(false);

  const [progressPercentage, setProgressPercentage] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(
    item.title ? 7200 : 2700
  );
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Invisible Click-Shield state to intercept initial ad/redirect overlays
  const [shieldActive, setShieldActive] = useState<boolean>(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const saveTimerRef = useRef<number | null>(null);

  const uniqueId = useMemo(() => {
    return mediaType === "tv" ? `tv-${item.id}` : `movie-${item.id}`;
  }, [mediaType, item.id]);

  const currentEmbedUrl = useMemo(() => {
    return selectedServer.getUrl(item.id, mediaType, season, episode);
  }, [selectedServer, item.id, mediaType, season, episode]);

  // Reset the shield whenever stream or episode changes
  useEffect(() => {
    setShieldActive(true);
  }, [selectedServer.id, item.id, season, episode]);

  useEffect(() => {
    let cancelled = false;

    const loadRuntime = async () => {
      try {
        if (mediaType === "tv") {
          const data = await fetchTMDB(`/tv/${item.id}`);
          if (cancelled) return;

          if (typeof data?.number_of_seasons === "number") {
            setTotalSeasons(data.number_of_seasons);
          }

          const seasonInfo = data?.seasons?.find(
            (x: { season_number: number }) => x.season_number === season
          );
          if (typeof seasonInfo?.episode_count === "number") {
            setEpisodesInSeason(seasonInfo.episode_count);
          }

          if (
            Array.isArray(data?.episode_run_time) &&
            data.episode_run_time.length > 0
          ) {
            const minutes = data.episode_run_time[0];
            if (typeof minutes === "number" && minutes > 0) {
              setDuration(minutes * 60);
            }
          }

          try {
            const epData = await fetchTMDB(
              `/tv/${item.id}/season/${season}/episode/${episode}`
            );
            if (cancelled) return;

            if (typeof epData?.runtime === "number" && epData.runtime > 0) {
              setDuration(epData.runtime * 60);
            }
          } catch {
            // ignore episode runtime failure
          }
        } else {
          const data = await fetchTMDB(`/movie/${item.id}`);
          if (cancelled) return;

          if (typeof data?.runtime === "number" && data.runtime > 0) {
            setDuration(data.runtime * 60);
          }
        }
      } catch {
        // ignore runtime failures
      }
    };

    loadRuntime();

    return () => {
      cancelled = true;
    };
  }, [item.id, mediaType, season, episode]);

  useEffect(() => {
    const list = getContinueWatchingList();
    const existing = list.find(
      (x) =>
        x.id === uniqueId ||
        (x.tmdbId === item.id && x.mediaType === mediaType)
    );

    if (existing) {
      if (existing.serverId) {
        const savedServer = STREAM_SERVERS.find(
          (s) => s.id === existing.serverId
        );
        if (savedServer) {
          setSelectedServer(savedServer);
        }
      }

      if (typeof existing.progressPercentage === "number") {
        setProgressPercentage(existing.progressPercentage);
      }

      if (typeof existing.currentTime === "number") {
        setCurrentTime(existing.currentTime);
      } else if (
        typeof existing.progressPercentage === "number" &&
        existing.progressPercentage > 0 &&
        duration > 0
      ) {
        setCurrentTime(
          Math.round((existing.progressPercentage / 100) * duration)
        );
      }

      if (typeof existing.duration === "number" && existing.duration > 0) {
        setDuration(existing.duration);
      }

      if (mediaType === "tv") {
        if (typeof existing.season === "number") setSeason(existing.season);
        if (typeof existing.episode === "number") setEpisode(existing.episode);
      }
    } else {
      setProgressPercentage(0);
      setCurrentTime(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uniqueId, item.id, mediaType]);

  useEffect(() => {
    const mediaTitle = item.title || item.name || "Title";
    if (mediaType === "tv") {
      document.title = `Watching ${mediaTitle} (S${season}:E${episode}) - FREEFLIX`;
    } else {
      document.title = `Watching ${mediaTitle} - FREEFLIX`;
    }

    return () => {
      document.title = "FREEFLIX - Stream Movies & TV Shows";
    };
  }, [item, mediaType, season, episode]);

  const persistState = () => {
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
      season: mediaType === "tv" ? season : undefined,
      episode: mediaType === "tv" ? episode : undefined,
      certification: item.certification,
      voteAverage: item.vote_average,
      completed: progressPercentage >= 95,
      serverId: selectedServer.id,
    });

    if (onProgressUpdate) onProgressUpdate();
  };

  useEffect(() => {
    const handleSaveState = () => {
      persistState();
    };

    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
        persistState();
      }
    };

    window.addEventListener("beforeunload", handleSaveState);
    window.addEventListener("pagehide", handleSaveState);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      handleSaveState();
      window.removeEventListener("beforeunload", handleSaveState);
      window.removeEventListener("pagehide", handleSaveState);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    uniqueId,
    progressPercentage,
    currentTime,
    duration,
    season,
    episode,
    selectedServer.id,
  ]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        const raw = event.data;
        const data: PlayerMessage =
          typeof raw === "string" ? JSON.parse(raw) : raw;

        if (!data || typeof data !== "object") return;

        const eventType = String(
          data.event || data.type || data.status || ""
        ).toLowerCase();

        if (eventType.includes("play") || eventType.includes("start")) {
          setIsPlaying(true);
        } else if (
          eventType.includes("pause") ||
          eventType.includes("stop") ||
          eventType.includes("end")
        ) {
          setIsPlaying(false);
        } else if (
          eventType.includes("fullscreen") ||
          eventType.includes("requestfullscreen") ||
          eventType.includes("enterfullscreen")
        ) {
          if (containerRef.current && !document.fullscreenElement) {
            containerRef.current.requestFullscreen?.().catch(() => {});
          }
        }

        const payload =
          (data.data as Record<string, unknown>) ||
          (data.payload as Record<string, unknown>) ||
          (data as unknown as Record<string, unknown>);

        const cur =
          payload.currentTime ??
          payload.time ??
          payload.seconds ??
          payload.position ??
          payload.secondsWatched;
        const dur = payload.duration ?? payload.totalDuration ?? payload.length;
        const pct = payload.progress ?? payload.percentage ?? payload.percent;

        if (typeof cur === "number" && typeof dur === "number" && dur > 0) {
          const roundedCurrent = Math.max(0, Math.round(cur));
          const roundedDuration = Math.max(1, Math.round(dur));
          const calculatedPct = Math.min(
            100,
            Math.max(0, Math.round((roundedCurrent / roundedDuration) * 100))
          );

          setCurrentTime(roundedCurrent);
          setDuration(roundedDuration);
          setProgressPercentage(calculatedPct);
          setIsPlaying(true);
        } else if (typeof pct === "number") {
          const normalizedPct = Math.min(
            100,
            Math.max(0, Math.round(pct <= 1 ? pct * 100 : pct))
          );
          setProgressPercentage(normalizedPct);
          if (duration > 0) {
            setCurrentTime(Math.round((normalizedPct / 100) * duration));
          }
          setIsPlaying(true);
        }
      } catch {
        // ignore malformed messages
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [duration]);

  useEffect(() => {
    if (saveTimerRef.current) {
      window.clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = window.setTimeout(() => {
      persistState();
    }, 400);

    return () => {
      if (saveTimerRef.current) {
        window.clearTimeout(saveTimerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progressPercentage, currentTime, duration, season, episode, selectedServer.id]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const toggleFullScreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch((err) => {
        console.error("Fullscreen request failed:", err);
      });
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleNextEpisode = () => {
    if (episode < episodesInSeason) {
      setEpisode((prev) => prev + 1);
    } else if (season < totalSeasons) {
      setSeason((prev) => prev + 1);
      setEpisode(1);
    }
  };

  const handleRestart = () => {
    setCurrentTime(0);
    setProgressPercentage(0);
    setIsPlaying(false);
    persistState();
  };

  const progressText = `${Math.max(0, Math.min(100, progressPercentage))}% watched`;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 z-50 bg-black/95 backdrop-blur-3xl flex flex-col justify-between"
      >
        {/* TOP HEADER CONTROLS */}
        <div className="w-full px-4 sm:px-8 py-4 sm:py-5 bg-gradient-to-b from-black/90 via-black/50 to-transparent flex items-center justify-between z-30 pointer-events-none">
          <div className="flex items-center gap-4 pointer-events-auto">
            <button
              onClick={onClose}
              className="p-2 sm:p-2.5 rounded-full bg-zinc-900/80 border border-white/10 text-white hover:bg-white hover:text-black hover:scale-110 transition-all backdrop-blur-md shadow-lg"
              title="Close player"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-[10px] sm:text-xs uppercase font-extrabold text-black bg-white px-2 py-0.5 rounded-md shadow-md tracking-wider">
                  FREEFLIX
                </span>
                <h2 className="text-sm sm:text-lg md:text-xl font-black text-white line-clamp-1 drop-shadow-md uppercase tracking-wide font-sans">
                  {title}
                </h2>
              </div>

              {mediaType === "tv" && (
                <p className="text-[10px] sm:text-xs text-zinc-300 font-bold mt-0.5 tracking-wide">
                  SEASON {season} • EPISODE {episode}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 pointer-events-auto">
            <button
              onClick={handleRestart}
              className="flex items-center gap-2 bg-zinc-900/80 border border-white/20 hover:border-white text-white px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-xl transition-all backdrop-blur-md"
              title="Restart playback"
            >
              <RotateCcw className="w-4 h-4 text-white" />
              <span className="hidden sm:inline">Restart</span>
            </button>

            <button
              onClick={toggleFullScreen}
              className="flex items-center gap-2 bg-zinc-900/80 border border-white/20 hover:border-white text-white px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-xl transition-all backdrop-blur-md"
              title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              <span>{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</span>
            </button>

            <div className="relative">
              <button
                onClick={() => setShowServerMenu((v) => !v)}
                className="flex items-center gap-2 bg-zinc-900/80 border border-white/20 hover:border-white text-white px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-xl transition-all backdrop-blur-md"
              >
                <Server className="w-4 h-4 text-white" />
                <span className="hidden sm:inline tracking-wide">
                  {selectedServer.name}
                </span>
                <span className="sm:hidden tracking-wide">
                  {selectedServer.id.toUpperCase()}
                </span>
                <ChevronDown className="w-4 h-4 text-zinc-400" />
              </button>

              {showServerMenu && (
                <div className="absolute right-0 mt-3 w-64 bg-zinc-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl z-50 p-2 space-y-1 max-h-80 overflow-y-auto">
                  <div className="text-[10px] font-black uppercase text-zinc-500 px-3 py-2 tracking-wider">
                    Select Streaming Server
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
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-left transition-all ${
                          isSelected
                            ? "bg-white text-black shadow-lg font-black"
                            : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="tracking-wide">{server.name}</span>
                          {server.badge && (
                            <span className="text-[9px] bg-black/50 px-1.5 py-0.5 rounded border border-white/10 font-black text-white uppercase">
                              {server.badge}
                            </span>
                          )}
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-black" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* VIDEO PLAYER CONTAINER */}
        <div
          ref={containerRef}
          className="relative flex-1 w-full bg-black flex items-center justify-center overflow-hidden"
        >
          {/* CLICK SHIELD OVERLAY: Traps and destroys hidden ad-click redirects */}
          {shieldActive && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                setShieldActive(false);
              }}
              className="absolute inset-0 z-20 bg-transparent cursor-pointer"
              title="Click once to activate video player"
            />
          )}

          <iframe
            key={`${selectedServer.id}-${season}-${episode}`}
            src={currentEmbedUrl}
            title={title}
            className="w-full h-full border-0 absolute inset-0 z-10"
            allow="autoplay; fullscreen; encrypted-media; picture-in-picture; accelerometer; gyroscope; clipboard-write; web-share"
            allowFullScreen
            /* STRICT SANDBOX: Completely blocks popups, popunders, and top-level site redirects */
            sandbox="allow-scripts allow-same-origin allow-presentation"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* BOTTOM BAR CONTROLS */}
        <div className="w-full px-4 sm:px-8 py-4 bg-gradient-to-t from-black via-black/80 to-transparent flex flex-wrap items-center justify-between gap-3 z-30 pointer-events-none">
          <div className="flex items-center gap-3 pointer-events-auto">
            <div className="flex items-center gap-2 bg-zinc-900/80 backdrop-blur-md border border-white/10 rounded-xl px-3 py-2 shadow-lg text-white">
              {mediaType === "tv" ? (
                <Tv className="w-4 h-4" />
              ) : (
                <Film className="w-4 h-4" />
              )}
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                {mediaType.toUpperCase()}
              </span>
            </div>

            <div className="flex items-center gap-2 bg-zinc-900/80 backdrop-blur-md border border-white/10 rounded-xl px-3 py-2 shadow-lg text-white">
              <Clock className="w-4 h-4" />
         
