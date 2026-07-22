export type MediaType = 'movie' | 'tv';

export interface MediaItem {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  media_type?: MediaType;
  vote_average: number;
  vote_count?: number;
  release_date?: string;
  first_air_date?: string;
  overview: string;
  genre_ids?: number[];
  certification?: string; // e.g., PG-13, R, TV-MA, PG, TV-14
}

export interface ContinueWatchingItem {
  id: string; // unique key (e.g. movie-123 or tv-456-s1-e2)
  tmdbId: number;
  mediaType: MediaType;
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
  progressPercentage: number; // 0 - 100
  currentTime?: number; // in seconds
  duration?: number; // in seconds
  season?: number;
  episode?: number;
  certification?: string;
  voteAverage?: number;
  completed?: boolean;
  serverId?: string;
  lastUpdated: number; // timestamp
}

export interface StreamingProvider {
  id: string;
  name: string;
  logoSvg: string; // inline SVG or crisp vector brand logo URL
  networkId?: number; // TMDB network ID for TV shows
  providerId?: number; // TMDB watch provider ID for movies
  companyId?: number; // TMDB production company ID for studios
  badgeColor: string;
}

export interface ServerOption {
  id: string;
  name: string;
  badge?: string;
  quality: string;
  speed: 'Fast' | 'Ultra Fast' | 'Standard';
  supportsTv: boolean;
  getUrl: (tmdbId: number, type: MediaType, season?: number, episode?: number) => string;
}

export interface SeasonInfo {
  season_number: number;
  name: string;
  episode_count: number;
  poster_path: string | null;
}

export interface EpisodeInfo {
  episode_number: number;
  name: string;
  overview: string;
  still_path: string | null;
  air_date: string;
}
