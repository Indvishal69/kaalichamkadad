import { useCallback, useEffect, useState } from 'react';
import { videos, type Video } from '../data/channel';

const STORAGE_KEY = 'kaali-chamkadad:queue';

function readQueue(): string[] {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]') as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (id): id is string => typeof id === 'string' && videos.some((video) => video.id === id),
    );
  } catch {
    return [];
  }
}

/** A tiny watch-later queue that survives reloads. */
export function useQueue() {
  const [ids, setIds] = useState<string[]>(readQueue);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch {
      /* The queue still works for this session. */
    }
  }, [ids]);

  const toggle = useCallback((id: string) => {
    setIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }, []);

  const remove = useCallback((id: string) => {
    setIds((current) => current.filter((item) => item !== id));
  }, []);

  const clear = useCallback(() => setIds([]), []);

  const queue = ids
    .map((id) => videos.find((video) => video.id === id))
    .filter((video): video is Video => Boolean(video));

  return { queue, ids, toggle, remove, clear };
}
