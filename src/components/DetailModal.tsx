import React, { useState, useEffect } from 'react';
import { X, Play, Star, Calendar, Clock, Film, Check, Plus, Share2 } from 'lucide-react';
import { MediaItem, MediaType } from '../types';
import { fetchTMDB, getCertification } from '../services/tmdb';

interface DetailModalProps {
  item: MediaItem;
  onClose: () => void;
  onPlay: (item: MediaItem) => void;
}

export const DetailModal: React.FC<DetailModalProps> = ({ item, onClose, onPlay }) => {
  const [certification, setCertification] = useState<string>('PG-13');
  const [cast, setCast] = useState<string[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [similar, setSimilar] = useState<MediaItem[]>([]);
  const [isSaved, setIsSaved] = useState<boolean>(false);

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

    // Fetch details & credits
    fetchTMDB(`/${mediaType}/${item.id}?append_to_response=credits,similar`)
      .then((data) => {
        if (data.genres) {
          setGenres(data.genres.map((g: { name: string }) => g.name));
        }
        if (data.credits?.cast) {
          setCast(data.credits.cast.slice(0, 5).map((c: { name: string }) => c.name));
        }
        if (data.similar?.results) {
          setSimilar(data.similar.results.slice(0, 6));
        }
      })
      .catch(() => {});
  }, [item, mediaType]);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#181818] rounded-2xl overflow-hidden shadow-2xl border border-white/10 my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/70 text-white hover:bg-red-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Banner Header */}
        <div className="relative aspect-video w-full overflow-hidden bg-black">
          <img
            src={backdropUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-[#181818]/40 to-transparent" />

          {/* Title & Actions inside hero */}
          <div className="absolute bottom-6 left-6 right-6 space-y-3">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-sans drop-shadow-xl">
              {title}
            </h2>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  onClose();
                  onPlay(item);
                }}
                className="flex items-center justify-center gap-2 bg-[#E50914] hover:bg-red-700 text-white font-extrabold text-sm sm:text-base px-6 py-2.5 rounded shadow-xl transition-transform transform hover:scale-105"
              >
                <Play className="w-5 h-5 fill-white" />
                Play Now
              </button>

              <button
                onClick={() => setIsSaved(!isSaved)}
                className="p-2.5 rounded-full bg-black/60 border border-white/30 text-white hover:border-white transition-colors"
              >
                {isSaved ? <Check className="w-5 h-5 text-green-400" /> : <Plus className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Details Content Body */}
        <div className="p-6 space-y-6 text-gray-300 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Overview & Metadata */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-3 text-xs font-semibold">
                <span className="bg-[#E50914] text-white px-2 py-0.5 rounded uppercase font-black">
                  {mediaType}
                </span>
                <span className="border border-white/50 text-white font-bold px-2 py-0.5 rounded">
                  {certification}
                </span>
                <div className="flex items-center gap-1 text-yellow-400">
                  <Star className="w-4 h-4 fill-yellow-400 stroke-none" />
                  <span>{item.vote_average?.toFixed(1) || '8.5'}</span>
                </div>
                {(item.release_date || item.first_air_date) && (
                  <span className="text-gray-400">
                    {(item.release_date || item.first_air_date)?.split('-')[0]}
                  </span>
                )}
              </div>

              <p className="text-gray-200 text-sm sm:text-base leading-relaxed">
                {item.overview}
              </p>
            </div>

            {/* Cast & Genres Column */}
            <div className="space-y-3 bg-zinc-900/60 p-4 rounded-xl border border-white/5">
              {cast.length > 0 && (
                <div>
                  <span className="text-gray-400 text-xs block font-bold uppercase mb-1">Cast:</span>
                  <p className="text-white font-medium text-xs line-clamp-3">{cast.join(', ')}</p>
                </div>
              )}

              {genres.length > 0 && (
                <div>
                  <span className="text-gray-400 text-xs block font-bold uppercase mb-1">Genres:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {genres.map((g) => (
                      <span key={g} className="bg-zinc-800 text-gray-200 px-2 py-0.5 rounded text-[11px] font-semibold">
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* More Like This Row */}
          {similar.length > 0 && (
            <div className="pt-4 border-t border-white/10 space-y-3">
              <h3 className="text-base font-bold text-white uppercase tracking-wider">
                More Like This
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {similar.map((sim) => (
                  <div
                    key={sim.id}
                    onClick={() => {
                      onClose();
                      onPlay(sim);
                    }}
                    className="group relative aspect-[2/3] bg-zinc-900 rounded-lg overflow-hidden cursor-pointer border border-white/5 hover:border-[#E50914] transition-all transform hover:scale-105"
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
  );
};
