import React, { useState, useEffect } from 'react';
import { X, Play, Star, Check, Plus, Film, Tv, Tv2, Sparkles, Youtube } from 'lucide-react';
import { MediaItem, MediaType } from '../types';
import { fetchTMDB, getCertification } from '../services/tmdb';

interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

interface Episode {
  episode_number: number;
  name: string;
  overview: string;
  still_path: string | null;
  vote_average: number;
}

interface DetailModalProps {
  item: MediaItem;
  onClose: () => void;
  onPlay: (item: MediaItem, season?: number, episode?: number) => void;
  watchlist?: MediaItem[];
  onToggleWatchlist?: (item: MediaItem) => void;
}

export const DetailModal: React.FC<DetailModalProps> = ({
  item,
  onClose,
  onPlay,
  watchlist = [],
  onToggleWatchlist,
}) => {
  const [certification, setCertification] = useState<string>('PG-13');
  const [cast, setCast] = useState<CastMember[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [similar, setSimilar] = useState<MediaItem[]>([]);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [showTrailer, setShowTrailer] = useState<boolean>(false);

  // TV Seasons & Episodes state
  const [totalSeasons, setTotalSeasons] = useState<number>(1);
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState<boolean>(false);

  const isSaved = watchlist.some((w) => w.id === item.id);
  const mediaType: MediaType = item.media_type || (item.title ? 'movie' : 'tv');
  const title = item.title || item.name || 'Untitled';
  const backdropUrl = item.backdrop_path
    ? `https://image.tmdb.org/t/p/original${item.backdrop_path}`
    : `https://image.tmdb.org/t/p/original${item.poster_path}`;

  useEffect(() => {
    const mediaTitle = item.title || item.name || 'Untitled';
    document.title = `${mediaTitle} - FREEFLIX`;
    return () => {
      document.title = 'FREEFLIX - Stream Movies & TV Shows';
    };
  }, [item]);

  useEffect(() => {
    getCertification(item.id, mediaType).then(setCertification);

    // Fetch details, credits, videos, and similar
    fetchTMDB(`/${mediaType}/${item.id}?append_to_response=credits,similar,videos`)
      .then((data) => {
        if (data.genres) {
          setGenres(data.genres.map((g: { name: string }) => g.name));
        }
        if (data.credits?.cast) {
          setCast(
            data.credits.cast.slice(0, 8).map((c: any) => ({
              id: c.id,
              name: c.name,
              character: c.character || '',
              profile_path: c.profile_path,
            }))
          );
        }
        if (data.similar?.results) {
          setSimilar(
            data.similar.results
              .slice(0, 6)
              .map((s: MediaItem) => ({ ...s, media_type: mediaType }))
          );
        }

        // Find official trailer video
        if (data.videos?.results) {
          const trailer =
            data.videos.results.find(
              (v: any) => v.site === 'YouTube' && v.type === 'Trailer'
            ) || data.videos.results.find((v: any) => v.site === 'YouTube');
          if (trailer?.key) {
            setTrailerKey(trailer.key);
          }
        }

        if (mediaType === 'tv' && data.number_of_seasons) {
          setTotalSeasons(data.number_of_seasons);
        }
      })
      .catch(() => {});
  }, [item, mediaType]);

  // Fetch episodes when selectedSeason changes for TV
  useEffect(() => {
    if (mediaType !== 'tv') return;
    setLoadingEpisodes(true);
    fetchTMDB(`/tv/${item.id}/season/${selectedSeason}`)
      .then((data) => {
        if (data.episodes) {
          setEpisodes(data.episodes);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingEpisodes(false));
  }, [item.id, mediaType, selectedSeason]);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#121214] rounded-3xl overflow-hidden shadow-2xl border border-white/10 my-6 max-h-[92vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-2.5 rounded-full bg-black/70 text-white hover:bg-white hover:text-black transition-all shadow-lg border border-white/10"
          title="Close details"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Container */}
        <div className="overflow-y-auto no-scrollbar flex-1">
          {/* Hero Banner or Embedded Trailer */}
          <div className="relative aspect-video w-full overflow-hidden bg-black">
            {showTrailer && trailerKey ? (
              <div className="relative w-full h-full">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${trailerKey}?autoplay=1&rel=0`}
                  title={`${title} Official Trailer`}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
                <button
                  onClick={() => setShowTrailer(false)}
                  className="absolute top-4 left-4 z-20 bg-black/80 hover:bg-white hover:text-black text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/20 backdrop-blur-md transition-all"
                >
                  Back to Poster
                </button>
              </div>
            ) : (
              <>
                <img
                  src={backdropUrl}
                  alt={title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#121214] via-[#121214]/50 to-transparent" />

                {/* Title & Actions inside hero */}
                <div className="absolute bottom-6 left-6 right-6 space-y-3 z-10">
                  <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight font-sans drop-shadow-2xl uppercase">
                    {title}
                  </h2>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => {
                        onClose();
                        onPlay(item, 1, 1);
                      }}
                      className="flex items-center justify-center gap-2 bg-white hover:bg-zinc-200 text-black font-extrabold text-sm sm:text-base px-6 py-2.5 rounded-full shadow-xl transition-transform transform hover:scale-105"
                    >
                      <Play className="w-5 h-5 fill-black text-black" />
                      Stream Now
                    </button>

                    {trailerKey && (
                      <button
                        onClick={() => setShowTrailer(true)}
                        className="flex items-center gap-2 bg-zinc-900/90 hover:bg-zinc-800 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-full border border-white/20 backdrop-blur-md transition-all shadow-lg"
                      >
                        <Youtube className="w-4 h-4 text-red-500" />
                        Watch Trailer
                      </button>
                    )}

                    <button
                      onClick={() => onToggleWatchlist?.(item)}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-full border text-xs sm:text-sm font-bold transition-all backdrop-blur-md ${
                        isSaved
                          ? 'bg-white/20 border-white text-white'
                          : 'bg-black/60 border-white/30 text-white hover:border-white'
                      }`}
                      title={isSaved ? 'Remove from My Stuff' : 'Add to My Stuff'}
                    >
                      {isSaved ? (
                        <>
                          <Check className="w-4 h-4 text-white" />
                          <span>Saved in My Stuff</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          <span>Add to My Stuff</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Details Content Body */}
          <div className="p-6 sm:p-8 space-y-8 text-zinc-300 text-sm">
            {/* Overview & Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-4">
                <div className="flex items-center gap-3 text-xs font-semibold">
                  <span className="bg-white text-black px-2.5 py-0.5 rounded-md uppercase font-black tracking-wider">
                    {mediaType}
                  </span>
                  <span className="border border-white/30 text-white font-bold px-2 py-0.5 rounded-md">
                    {certification}
                  </span>
                  <div className="flex items-center gap-1 text-white bg-black/60 px-2 py-0.5 rounded-md border border-white/10">
                    <Star className="w-3.5 h-3.5 fill-white stroke-none" />
                    <span className="font-bold">{item.vote_average?.toFixed(1) || '8.5'}</span>
                  </div>
                  {(item.release_date || item.first_air_date) && (
                    <span className="text-zinc-400 font-bold">
                      {(item.release_date || item.first_air_date)?.split('-')[0]}
                    </span>
                  )}
                </div>

                <p className="text-zinc-200 text-sm sm:text-base leading-relaxed font-normal">
                  {item.overview || 'Stream this title in high-definition on FREEFLIX.'}
                </p>
              </div>

              {/* Genres Badge Box */}
              <div className="space-y-3 bg-zinc-900/80 p-5 rounded-2xl border border-white/10 shadow-lg">
                <span className="text-zinc-400 text-xs block font-extrabold uppercase tracking-wider">
                  Genres
                </span>
                <div className="flex flex-wrap gap-2">
                  {genres.map((g) => (
                    <span
                      key={g}
                      className="bg-zinc-800 text-white px-3 py-1 rounded-full text-xs font-bold border border-white/5"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Cast Row with Avatars */}
            {cast.length > 0 && (
              <div className="space-y-4 pt-2 border-t border-white/10">
                <h3 className="text-xs uppercase font-black tracking-wider text-zinc-400 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                  Featured Cast
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
                  {cast.map((c) => (
                    <div
                      key={c.id}
                      className="bg-zinc-900/60 p-2.5 rounded-2xl border border-white/5 flex flex-col items-center text-center space-y-2 hover:border-white/20 transition-all"
                    >
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-zinc-800 border border-white/10 shrink-0">
                        {c.profile_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w185${c.profile_path}`}
                            alt={c.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-500 text-xs font-bold">
                            {c.name[0]}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-white font-bold text-xs line-clamp-1">{c.name}</p>
                        <p className="text-zinc-500 text-[10px] line-clamp-1">{c.character}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TV Show Episodes Browser */}
            {mediaType === 'tv' && (
              <div className="space-y-4 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs uppercase font-black tracking-wider text-zinc-400 flex items-center gap-2">
                    <Tv2 className="w-4 h-4 text-white" />
                    Episodes & Seasons
                  </h3>

                  {/* Season Dropdown */}
                  {totalSeasons > 1 && (
                    <select
                      value={selectedSeason}
                      onChange={(e) => setSelectedSeason(Number(e.target.value))}
                      className="bg-zinc-800 text-white font-bold text-xs px-3 py-1.5 rounded-xl border border-white/20 focus:outline-none cursor-pointer"
                    >
                      {Array.from({ length: totalSeasons }, (_, i) => i + 1).map((s) => (
                        <option key={s} value={s}>
                          Season {s}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {loadingEpisodes ? (
                  <div className="py-8 text-center text-zinc-500 text-xs animate-pulse">
                    Loading season episodes...
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-72 overflow-y-auto no-scrollbar pr-1">
                    {episodes.map((ep) => (
                      <div
                        key={ep.episode_number}
                        onClick={() => {
                          onClose();
                          onPlay(item, selectedSeason, ep.episode_number);
                        }}
                        className="group bg-zinc-900/80 hover:bg-zinc-800 p-3 rounded-2xl border border-white/10 hover:border-white transition-all cursor-pointer flex gap-3 items-center"
                      >
                        <div className="relative w-24 aspect-video rounded-xl overflow-hidden bg-black shrink-0 border border-white/10">
                          {ep.still_path ? (
                            <img
                              src={`https://image.tmdb.org/t/p/w300${ep.still_path}`}
                              alt={ep.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs">
                              E{ep.episode_number}
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Play className="w-5 h-5 text-white fill-white" />
                          </div>
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-black text-white line-clamp-1">
                            {ep.episode_number}. {ep.name}
                          </p>
                          <p className="text-[11px] text-zinc-400 line-clamp-2 mt-0.5">
                            {ep.overview || 'Click to watch episode.'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* More Like This Row */}
            {similar.length > 0 && (
              <div className="pt-4 border-t border-white/10 space-y-4">
                <h3 className="text-xs uppercase font-black tracking-wider text-zinc-400">
                  More Like This
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  {similar.map((sim) => (
                    <div
                      key={sim.id}
                      onClick={() => {
                        onClose();
                        onPlay(sim, 1, 1);
                      }}
                      className="group relative aspect-[2/3] bg-zinc-900 rounded-2xl overflow-hidden cursor-pointer border border-white/10 hover:border-white transition-all transform hover:scale-105 shadow-md"
                    >
                      <img
                        src={
                          sim.poster_path
                            ? `https://image.tmdb.org/t/p/w300${sim.poster_path}`
                            : backdropUrl
                        }
                        alt={sim.title || sim.name || ''}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center p-2 text-center transition-opacity">
                        <Play className="w-8 h-8 text-white fill-white" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

