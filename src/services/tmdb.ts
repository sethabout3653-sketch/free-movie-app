import { StreamingProvider, ServerOption, MediaType } from '../types';

export const TMDB_API_KEY = '74a6132d309245d487e3b93904335056';
export const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

// High quality official network and studio brand logos
export const STREAMING_PROVIDERS: StreamingProvider[] = [
  {
    id: 'netflix',
    name: 'Netflix',
    badgeColor: '#E50914',
    logoSvg: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg',
    networkId: 213,
    providerId: 8,
  },
  {
    id: 'hulu',
    name: 'Hulu',
    badgeColor: '#1CE783',
    logoSvg: 'https://upload.wikimedia.org/wikipedia/commons/e/e4/Hulu_Logo.svg',
    networkId: 453,
    providerId: 15,
  },
  {
    id: 'peacock',
    name: 'Peacock',
    badgeColor: '#000000',
    logoSvg: 'https://upload.wikimedia.org/wikipedia/commons/d/d3/NBCUniversal_Peacock_Logo.svg',
    networkId: 3353,
    providerId: 386,
  },
  {
    id: 'paramount',
    name: 'Paramount+',
    badgeColor: '#0064FF',
    logoSvg: 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Paramount_Plus_logo.svg',
    networkId: 4330,
    providerId: 531,
  },
  {
    id: 'crunchyroll',
    name: 'Crunchyroll',
    badgeColor: '#F47521',
    logoSvg: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Crunchyroll_Logo.svg',
    networkId: 1112,
    providerId: 283,
  },
  {
    id: 'appletv',
    name: 'Apple TV+',
    badgeColor: '#FFFFFF',
    logoSvg: 'https://upload.wikimedia.org/wikipedia/commons/2/28/Apple_TV_Plus_Logo.svg',
    networkId: 2552,
    providerId: 350,
  },
  {
    id: 'disney',
    name: 'Disney+',
    badgeColor: '#113CCF',
    logoSvg: 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Disney%2B_logo.svg',
    networkId: 2739,
    providerId: 337,
  },
  {
    id: 'max',
    name: 'Max (HBO)',
    badgeColor: '#002BE7',
    logoSvg: 'https://upload.wikimedia.org/wikipedia/commons/c/ce/Max_logo.svg',
    networkId: 3186,
    providerId: 1899,
  },
  {
    id: 'prime',
    name: 'Prime Video',
    badgeColor: '#00A8E1',
    logoSvg: 'https://upload.wikimedia.org/wikipedia/commons/1/11/Amazon_Prime_Video_logo.svg',
    networkId: 1024,
    providerId: 9,
  },
  {
    id: 'marvel',
    name: 'Marvel Studios',
    badgeColor: '#ED1D24',
    logoSvg: 'https://upload.wikimedia.org/wikipedia/commons/0/04/MarvelStudios.svg',
    companyId: 420,
  },
  {
    id: 'warnerbros',
    name: 'Warner Bros.',
    badgeColor: '#003087',
    logoSvg: 'https://upload.wikimedia.org/wikipedia/commons/6/64/Warner_Bros_logo.svg',
    companyId: 174,
  },
  {
    id: 'universal',
    name: 'Universal Pictures',
    badgeColor: '#000000',
    logoSvg: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Universal_Pictures_logo.svg',
    companyId: 33,
  },
  {
    id: 'sony',
    name: 'Sony Pictures',
    badgeColor: '#000000',
    logoSvg: 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Sony_Pictures_logo.svg',
    companyId: 34,
  },
  {
    id: 'a24',
    name: 'A24',
    badgeColor: '#000000',
    logoSvg: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/A24_logo.svg',
    companyId: 41077,
  },
  {
    id: 'starz',
    name: 'Starz',
    badgeColor: '#000000',
    logoSvg: 'https://upload.wikimedia.org/wikipedia/commons/6/60/Starz_2022.svg',
    networkId: 318,
    providerId: 43,
  },
  {
    id: 'showtime',
    name: 'Showtime',
    badgeColor: '#FF0000',
    logoSvg: 'https://upload.wikimedia.org/wikipedia/commons/2/22/Showtime.svg',
    networkId: 67,
    providerId: 37,
  },
  {
    id: 'amc',
    name: 'AMC',
    badgeColor: '#000000',
    logoSvg: 'https://upload.wikimedia.org/wikipedia/commons/1/1d/AMC_Logo.svg',
    networkId: 174,
  },
  {
    id: 'fx',
    name: 'FX',
    badgeColor: '#000000',
    logoSvg: 'https://upload.wikimedia.org/wikipedia/commons/8/87/FX_Network_logo.svg',
    networkId: 88,
  },
  {
    id: 'pixar',
    name: 'Pixar',
    badgeColor: '#000000',
    logoSvg: 'https://upload.wikimedia.org/wikipedia/commons/4/40/Pixar_logo.svg',
    companyId: 3,
  }
];

// Stream servers list
export const STREAM_SERVERS: ServerOption[] = [
  {
    id: 'vidplays',
    name: 'VidPlays',
    badge: 'Ultra HD',
    quality: '1080p HD',
    speed: 'Ultra Fast',
    supportsTv: true,
    getUrl: (id, type, s = 1, e = 1) =>
      type === 'movie'
        ? `https://vidplays.com/e/movie/${id}`
        : `https://vidplays.com/e/tv/${id}/${s}/${e}`,
  },
  {
    id: 'vidsrc',
    name: 'VidSrc',
    badge: 'Popular',
    quality: '1080p',
    speed: 'Fast',
    supportsTv: true,
    getUrl: (id, type, s = 1, e = 1) =>
      type === 'movie'
        ? `https://vidsrc.me/embed/movie?tmdb=${id}`
        : `https://vidsrc.me/embed/tv?tmdb=${id}&season=${s}&episode=${e}`,
  },
  {
    id: 'videasy',
    name: 'VidEasy',
    badge: 'Ultra Fast',
    quality: '1080p HD',
    speed: 'Ultra Fast',
    supportsTv: true,
    getUrl: (id, type, s = 1, e = 1) =>
      type === 'movie'
        ? `https://player.videasy.net/movie/${id}`
        : `https://player.videasy.net/tv/${id}/${s}/${e}`,
  },
];

// In-memory certification cache to prevent redundant TMDB API calls
const certificationCache: Record<string, string> = {};

export async function fetchTMDB(endpoint: string, params: Record<string, string> = {}) {
  const query = new URLSearchParams({
    api_key: TMDB_API_KEY,
    language: 'en-US',
    ...params,
  }).toString();

  const res = await fetch(`${TMDB_BASE_URL}${endpoint}?${query}`);
  if (!res.ok) {
    throw new Error(`TMDB error ${res.status}`);
  }
  return res.json();
}

// Helper to fetch Content Rating / Certification (PG-13, TV-MA, R, etc.)
export async function getCertification(id: number, type: MediaType): Promise<string> {
  const cacheKey = `${type}-${id}`;
  if (certificationCache[cacheKey]) {
    return certificationCache[cacheKey];
  }

  try {
    if (type === 'movie') {
      const data = await fetchTMDB(`/movie/${id}/release_dates`);
      const usRelease = data.results?.find((r: { iso_3166_1: string }) => r.iso_3166_1 === 'US');
      if (usRelease?.release_dates) {
        for (const rd of usRelease.release_dates) {
          if (rd.certification && rd.certification.trim() !== '') {
            certificationCache[cacheKey] = rd.certification;
            return rd.certification;
          }
        }
      }
      // fallback to any certification found
      for (const r of data.results || []) {
        for (const rd of r.release_dates || []) {
          if (rd.certification) {
            certificationCache[cacheKey] = rd.certification;
            return rd.certification;
          }
        }
      }
    } else {
      const data = await fetchTMDB(`/tv/${id}/content_ratings`);
      const usRating = data.results?.find((r: { iso_3166_1: string }) => r.iso_3166_1 === 'US');
      if (usRating?.rating) {
        certificationCache[cacheKey] = usRating.rating;
        return usRating.rating;
      }
      if (data.results && data.results.length > 0 && data.results[0].rating) {
        certificationCache[cacheKey] = data.results[0].rating;
        return data.results[0].rating;
      }
    }
  } catch {
    // default rating fallback based on deterministic algorithm if network fails
  }

  const defaultRating = type === 'movie' ? 'PG-13' : 'TV-MA';
  certificationCache[cacheKey] = defaultRating;
  return defaultRating;
}
