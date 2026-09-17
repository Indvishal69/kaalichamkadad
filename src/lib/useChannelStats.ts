import { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from './firebase';
import { channelStats as defaultStats } from '../data/channel';

export type ChannelStats = typeof defaultStats;

export function useChannelStats() {
  const [stats, setStats] = useState<ChannelStats>(defaultStats);

  useEffect(() => {
    const statsRef = ref(db, 'channelStats');
    const unsubscribe = onValue(statsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setStats((prev) => ({
          ...prev,
          ...data,
        }));
      }
    });

    return () => unsubscribe();
  }, []);

  return stats;
}
