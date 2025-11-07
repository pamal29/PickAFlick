import { useState, useEffect } from 'react';
import { tmdbApi } from '../services/tmdb';
import MovieCard from '../components/Moviecard';

function Home() {
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const data = await tmdbApi.getTrending();
        setTrending(data);
      } catch (error) {
        console.error('Error fetching trending:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, []);

  const handleAddToWatchlist = (movie) => {
    // This will connect to your backend later
    console.log('Adding to watchlist:', movie);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-white mb-8">
        Trending This Week
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {trending.map((movie) => (
          <MovieCard 
            key={movie.id} 
            movie={movie}
            onAddToWatchlist={handleAddToWatchlist}
          />
        ))}
      </div>
    </div>
  );
}

export default Home;