import React, { useState, useEffect } from 'react';
import { Play, Star, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Hero() {
  const [movie, setMovie] = useState(null);
  const [nextMovie, setNextMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [cast, setCast] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [allMovies, setAllMovies] = useState([]);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [watchlistLoading, setWatchlistLoading] = useState(false);
  const { user, profile } = useAuth();
  const navigate = useNavigate();



  const toggleWatchlist = async () => {
    if (!user) {
      navigate('/login');  // redirect if not logged in
      return;
    }
    if (!movie) return;
    setWatchlistLoading(true);
    try {
      if (inWatchlist) {
        await fetch(`http://localhost:3001/api/watchlist/${user.id}/${movie.id}`, {
          method: 'DELETE'
        });
        setInWatchlist(false);
      } else {
        const res = await fetch(`http://localhost:3001/api/watchlist`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            username: profile?.username,
            movieId: movie.id,
            title: movie.title,
            poster: movie.poster,
            type: 'movie'
          })
        });
        if (res.status === 429) { alert('Watchlist full! (15 max)'); return; }
        setInWatchlist(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setWatchlistLoading(false);
    }
  };

// Update checkWatchlist too:
const checkWatchlist = async (movieId) => {
  if (!user) return;
  const res = await fetch(`http://localhost:3001/api/watchlist/${user.id}/check/${movieId}`);
  const data = await res.json();
  setInWatchlist(data.inWatchlist);
};


  useEffect(() => {
    if (movie) checkWatchlist(movie.id);
  }, [movie]);

  // Fetch cast for current movie
  const fetchCast = async (movieId) => {
    try {
      const response = await fetch(`http://localhost:3001/api/movie/${movieId}/credits`);
      if (!response.ok) {
        throw new Error('Failed to fetch cast');
      }
      const data = await response.json();
      setCast(data.cast.slice(0, 5));
    } catch (error) {
      console.error('Error fetching cast:', error);
      setCast([]);
    }
  };

  const fetchAllMovies = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/hero/all');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setAllMovies(data);
      if (data.length > 0) {
        setMovie(data[0]);
        setNextMovie(data[1] || data[0]);
        fetchCast(data[0].id);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching movies:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  const transitionToNextMovie = async (direction = 'next') => {
    if (isTransitioning || allMovies.length === 0) return;
    
    setIsTransitioning(true);
    
    let newIndex;
    if (direction === 'next') {
      newIndex = (currentIndex + 1) % allMovies.length;
    } else {
      newIndex = currentIndex === 0 ? allMovies.length - 1 : currentIndex - 1;
    }
    
    const newMovie = allMovies[newIndex];
    const nextNewMovie = allMovies[(newIndex + 1) % allMovies.length];
    
    fetchCast(newMovie.id);
    
    setTimeout(() => {
      setMovie(newMovie);
      setNextMovie(nextNewMovie);
      setCurrentIndex(newIndex);
      setIsTransitioning(false);
    }, 300);
  };

  useEffect(() => {
    fetchAllMovies();
  }, []);

  useEffect(() => {
    if (allMovies.length > 0) {
      const interval = setInterval(() => {
        transitionToNextMovie('next');
      }, 10000);
      
      return () => clearInterval(interval);
    }
  }, [currentIndex, allMovies, isTransitioning]);

  if (error) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <p className="text-red-500 text-xl mb-4">❌ Error: {error}</p>
          <p className="text-white mb-4">Make sure backend is running on http://localhost:3001</p>
          <button 
            onClick={() => {
              setError(null);
              setLoading(true);
              fetchAllMovies();
            }}
            className="bg-green-500 text-black px-6 py-2 rounded-full font-bold hover:bg-green-600"
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  if (loading || !movie) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading movies...</p>
          <p className="text-gray-400 text-sm mt-2">Connecting to backend...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-[60vh] md:min-h-[80vh] max-w-6xl mx-auto flex items-center justify-center bg-black relative overflow-hidden">
      {/* Background Images with Crossfade */}
      <div className="absolute inset-0">
        {/* Current Image */}
        <div 
          className={`absolute inset-0 transition-opacity duration-700 ${
            isTransitioning ? 'opacity-0' : 'opacity-100'
          }`}
        >
          {movie.backdrop && (
            <img
              src={movie.backdrop}
              alt={movie.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          )}
        </div>
        
        {/* Next Image (for smooth transition) */}
        {nextMovie && (
          <div 
            className={`absolute inset-0 transition-opacity duration-700 ${
              isTransitioning ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {nextMovie.backdrop && (
              <img
                src={nextMovie.backdrop}
                alt={nextMovie.title}
                className="w-full h-full object-cover"
              />
            )}
          </div>
        )}
        
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/40" />
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={() => transitionToNextMovie('prev')}
        disabled={isTransitioning}
        className="absolute left-4 z-20 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all disabled:opacity-30"
      >
        <ChevronLeft size={28} />
      </button>
      
      <button
        onClick={() => transitionToNextMovie('next')}
        disabled={isTransitioning}
        className="absolute right-4 z-20 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all disabled:opacity-30"
      >
        <ChevronRight size={28} />
      </button>

      {/* Content */}
      <div 
        className={`relative z-10 flex flex-col items-center justify-center space-y-6 px-4 mt-64 128 max-w-4xl text-center transition-all duration-500 ${
          isTransitioning ? 'opacity-0 transform translate-y-4' : 'opacity-100 transform translate-y-0'
        }`}
      >
        {/* Movie Title */}
        <h1 className="text-white font-bold text-5xl md:text-6xl drop-shadow-2xl">
          {movie.title}
        </h1>
        
        {/* Movie Info */}
        <div className="flex items-center gap-4 font-bold text-white flex-wrap justify-center">
          <div className="flex items-center">
            <Star className="text-yellow-400 mr-1" fill="currentColor" size={20} />
            <p className="text-yellow-400">{movie.rating}</p>
          </div>
          <p>{movie.releaseYear}</p>
          <span className="px-3 py-1 bg-green-500 text-black text-sm font-bold rounded">HD</span>
        </div>

        {/* Cast & Crew Section with Hover Effect */}
        {cast.length > 0 && (
          <div className="w-full max-w-2xl">
            <p className="text-gray-300 text-sm mb-3 font-semibold tracking-wider">STARRING</p>
            <div className="flex justify-center gap-6 flex-wrap">
              {cast.map((actor, index) => (
                <div 
                  key={index} 
                  className="flex flex-col items-center space-y-2 transition-transform hover:scale-110 cursor-pointer"
                >
                  {actor.profile_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                      alt={actor.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-white/30 shadow-lg hover:border-green-500 transition-all"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23333" width="100" height="100"/%3E%3Ctext fill="%23666" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-size="40"%3E?%3C/text%3E%3C/svg%3E';
                      }}
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center border-2 border-white/30 hover:border-green-500 transition-all">
                      <span className="text-gray-400 text-2xl">?</span>
                    </div>
                  )}
                  <p className="text-white text-xs font-medium text-center max-w-[80px] truncate">
                    {actor.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        <p className="text-white text-lg max-w-2xl line-clamp-3 drop-shadow-lg">
          {movie.description || 'No description available'}
        </p>
        
        {/* Buttons */}
        <div className="flex space-x-4">
          <button 
            onClick={() => console.log('Navigate to trailer')}
            className="flex items-center space-x-2 bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-gray-200 transition-all transform hover:scale-105 shadow-xl"
          >
            <Play size={20} fill="currentColor" />
            <span>Watch Trailer</span>
          </button>
          <button 
            onClick={toggleWatchlist}
            disabled={watchlistLoading}
            className={`flex items-center space-x-2 px-8 py-3 rounded-full font-bold transition-all transform hover:scale-105 shadow-xl ${
              inWatchlist 
                ? 'bg-green-500 text-black hover:bg-green-400' 
                : 'bg-gray-800/90 backdrop-blur text-white hover:bg-gray-700'
            }`}
          >
            <Plus size={20} className={inWatchlist ? 'rotate-45' : ''} />
            <span>{watchlistLoading ? '...' : inWatchlist ? 'Added' : 'My List'}</span>
          </button>
        </div>
      </div>
    </section>
  );
}