import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const MAX_SHELF = 15;
const API = 'http://localhost:3001/api/watchlist';

export function useWatchlist(user, profile) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const checkInWatchlist = async (movieId, type= 'movie') => {
    if (!user) return false;
    try {
      const res = await fetch(`${API}/${user.id}/check/${movieId}?type=${type}`);
      if (!res.ok) return false;
      const data = await res.json();
      return data.inWatchlist;
    } catch (error) {
      console.error('Watchlist check failed:', error);
      return false;
    }
  };

  const addToWatchlist = async (item, type = 'movie') => {
    if (!user) {
      setShowLoginModal(true);
      return null;
    }

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
          type: item.type ?? type,
        }),
      });

      if (res.status === 429) {
        toast(
          (t) => (
            <span className="flex items-center gap-3">
              Your shelf is full ({MAX_SHELF}/{MAX_SHELF}). Remove a title to add a new one.
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  navigate('/watchlist');
                }}
                className="font-bold text-accent underline whitespace-nowrap"
              >
                View shelf
              </button>
            </span>
          ),
          { id: 'shelf-full', duration: 5000 }
        );
        return null;
      }
      if (res.status === 409) {
        toast('Already in your watchlist');
        return null;
      }
      if (!res.ok) {
        throw new Error(`Add failed with status ${res.status}`);
      }

      const data = await res.json();
      toast.success('Added to watchlist');
      return data;
    } catch (error) {
      console.error(error);
      toast.error('Something went wrong, try again');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const removeFromWatchlist = async (item, type) => {
    if (!user) return false;

    const mediaType = type ?? item.type ?? 'movie';
    setLoading(true);
    try {
      const res = await fetch(
        `${API}/${user.id}/${item.movie_id ?? item.id}?type=${mediaType}`,
        { method: 'DELETE' }
      );
      if (!res.ok) throw new Error(`Remove failed with status ${res.status}`);

      toast.success('Removed from watchlist');
      return true;
    } catch (error) {
      console.error(error);
      toast.error('Something went wrong, try again');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    checkInWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    loading,
    showLoginModal,
    setShowLoginModal,
  };
}