import { useState } from 'react';

const API = 'http://localhost:3001/api/watchlist';

export function useWatchlist(user, profile) {
  const [loading, setLoading] = useState(false);

  const checkInWatchlist = async (movieId) => {
    if (!user) return false;
    const res = await fetch(`${API}/${user.id}/check/${movieId}`);
    const data = await res.json();
    return data.inWatchlist;
  };

  const addToWatchlist = async (item, type = 'movie') => {
    setLoading(true);
    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          username: profile?.username,
          movieId: item.id,
          title: item.title,
          poster: item.poster,
          type: item.type ?? type
        })
      });
      if (res.status === 429) { alert('Watchlist full! (15 max)'); return null; }
      if (res.status === 409) return null;
      return await res.json();
    } finally {
      setLoading(false);
    }
  };

  const removeFromWatchlist = async (item) => {
    setLoading(true);
    try {
      await fetch(`${API}/${user.id}/${item.movie_id ?? item.id}`, { method: 'DELETE' });
    } finally {
      setLoading(false);
    }
  };

  return { checkInWatchlist, addToWatchlist, removeFromWatchlist, loading };
}