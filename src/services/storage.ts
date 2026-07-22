import { ContinueWatchingItem } from '../types';

const STORAGE_KEY = 'freenetflix_continue_watching';

export function getContinueWatchingList(): ContinueWatchingItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const list: ContinueWatchingItem[] = JSON.parse(raw);
    return list.sort((a, b) => b.lastUpdated - a.lastUpdated);
  } catch (e) {
    console.error('Failed to load continue watching:', e);
    return [];
  }
}

export function saveContinueWatchingItem(item: Omit<ContinueWatchingItem, 'lastUpdated'>): ContinueWatchingItem[] {
  const current = getContinueWatchingList();
  const existingIndex = current.findIndex((i) => i.id === item.id || (i.tmdbId === item.tmdbId && i.mediaType === item.mediaType));

  const newItem: ContinueWatchingItem = {
    ...item,
    lastUpdated: Date.now(),
  };

  if (existingIndex > -1) {
    current[existingIndex] = {
      ...current[existingIndex],
      ...newItem,
    };
  } else {
    current.unshift(newItem);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  return current.sort((a, b) => b.lastUpdated - a.lastUpdated);
}

export function removeContinueWatchingItem(id: string): ContinueWatchingItem[] {
  const current = getContinueWatchingList();
  const updated = current.filter((i) => i.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function toggleCompletedStatus(id: string): ContinueWatchingItem[] {
  const current = getContinueWatchingList();
  const updated = current.map((item) => {
    if (item.id === id) {
      return {
        ...item,
        completed: !item.completed,
        progressPercentage: !item.completed ? 100 : item.progressPercentage,
        lastUpdated: Date.now(),
      };
    }
    return item;
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated.sort((a, b) => b.lastUpdated - a.lastUpdated);
}

export function clearAllContinueWatching(): ContinueWatchingItem[] {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  return [];
}
