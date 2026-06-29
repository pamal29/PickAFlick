import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';

const userId = localStorage.getItem('userId') || 'guest_001';
const username = localStorage.getItem('username') || 'Guest';

export default function WatchlistPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWatchlist = async () => {
    setLoading(true);
    const res = await fetch(`http://localhost:3001/api/watchlist/${userId}`);
    const data = await res.json();
    setItems(data);
    setLoading(false);
  };

  const remove = async (movieId) => {
    await fetch(`http://localhost:3001/api/watchlist/${userId}/${movieId}`, {
      method: 'DELETE'
    });
    setItems(prev => prev.filter(i => i.movie_id !== movieId));
  };

  useEffect(() => { fetchWatchlist(); }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white px-6 py-10">
      <h1 className="text-3xl font-bold mb-1">{username}'s Watchlist</h1>
      <p className="text-gray-400 mb-8">{items.length} / 15 items</p>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : items.length === 0 ? (
        <p className="text-gray-500">Nothing saved yet. Browse and hit <strong>My List</strong>!</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {items.map(item => (
            <div key={item.id} className="relative group rounded-lg overflow-hidden bg-gray-800">
              <img
                src={item.poster ? `https://image.tmdb.org/t/p/w300${item.poster}` : '/no-poster.png'}
                alt={item.title}
                className="w-full object-cover"
              />
              <div className="p-2">
                <p className="text-sm font-semibold truncate">{item.title}</p>
                <p className="text-xs text-gray-400 capitalize">{item.type}</p>
              </div>
              <button
                onClick={() => remove(item.movie_id)}
                className="absolute top-2 right-2 bg-black/60 hover:bg-red-600 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}