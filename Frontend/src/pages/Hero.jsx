import React, { useState, useEffect } from 'react';
import { Play, Star, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useWatchlist } from '../hooks/useWatchlist';
import ShelfSection from './ShelfSection';
import BrowseSection from './BrowseSection';

export default function Hero() {
  //Carousel state
  const [movie, setMovie] = useState(null);
  const [nextMovie, setNextMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [cast, setCast] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [allMovies, setAllMovies] = useState([]);
  const [inWatchlist, setInWatchlist] = useState(false);

  //Shelf + browse grid state
  const [shelfItems, setShelfItems] = useState([]);
  const [shelfLoading, setShelfLoading] = useState(true);

  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { checkInWatchlist, addToWatchlist, removeFromWatchlist, loading: watchlistLoading } = useWatchlist(user, profile);

  //Carousel's own save/remove toggle 
  const toggleWatchlist = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!movie) return;

    if (inWatchlist) {
      await removeFromWatchlist(movie);
      setInWatchlist(false);
    } else {
      const result = await addToWatchlist(movie);
      if (result) setInWatchlist(true);
    }
  };

  useEffect(() => {
    if (movie) checkInWatchlist(movie.id).then(setInWatchlist);
  }, [movie, user]);

  //Shelf add/remove (used by browse grid + shelf grid) 
  const handleAddToShelf = async (item) => {
    if (!user) {
      navigate('/login');
      return;
    }
    const newItem = await addToWatchlist(item);
    if (newItem) setShelfItems(prev => [...prev, ...(Array.isArray(newItem) ? newItem : [newItem])]);
  };

  const handleRemoveFromShelf = async (item) => {
    if (!user) return;
    await removeFromWatchlist(item);
    setShelfItems(prev => prev.filter(i => i.id !== item.id));
  };

  const fetchCast = async (movieId) => {
    try {
      const response = await fetch(`http://localhost:3001/api/movie/${movieId}/credits`);
      if (!response.ok) throw new Error('Failed to fetch cast');
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
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
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

  //  Fetch the user's saved shelf 
  useEffect(() => {
    async function fetchShelf() {
      if (!user) {
        setShelfLoading(false);
        return;
      }
      try {
        const res = await fetch(`http://localhost:3001/api/watchlist/${user.id}`);
        if (!res.ok) throw new Error('Failed to fetch watchlist');
        const data = await res.json();
        setShelfItems(data);
      } catch (err) {
        console.error('Error fetching shelf:', err);
        setShelfItems([]);
      } finally {
        setShelfLoading(false);
      }
    }
    fetchShelf();
  }, [user]);

  const goToDetails = (item) => {
    const path = item.type === 'tv' ? `/tv/${item.id}` : `/movie/${item.id}`;
    navigate(path);
  };

  //  Error / loading states for the carousel 
  if (error) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <p className="text-danger text-xl mb-4">❌ Error: {error}</p>
          <p className="text-textPrimary mb-4">Make sure backend is running on http://localhost:3001</p>
          <button
            onClick={() => {
              setError(null);
              setLoading(true);
              fetchAllMovies();
            }}
            className="bg-accent text-black px-6 py-2 rounded-full font-bold hover:bg-accentHover"
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
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-textPrimary text-xl">Loading movies...</p>
          <p className="text-textSecond text-sm mt-2">Connecting to backend...</p>
        </div>
      </section>
    );
  }

  return (
    <div className="bg-black min-h-screen text-textPrimary">
      {/* CAROUSEL */}
      <section className="min-h-[60vh] md:min-h-[80vh] max-w-6xl mx-auto flex items-center justify-center bg-black relative overflow-hidden">
        <div className="absolute inset-0">
          <div className={`absolute inset-0 transition-opacity duration-700 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
            {movie.backdrop && (
              <img
                src={movie.backdrop}
                alt={movie.title}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            )}
          </div>

          {nextMovie && (
            <div className={`absolute inset-0 transition-opacity duration-700 ${isTransitioning ? 'opacity-100' : 'opacity-0'}`}>
              {nextMovie.backdrop && (
                <img src={nextMovie.backdrop} alt={nextMovie.title} className="w-full h-full object-cover" />
              )}
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/40" />
        </div>

        <button
          onClick={() => transitionToNextMovie('prev')}
          disabled={isTransitioning}
          className="absolute left-4 z-20 bg-surface/50 hover:bg-surface/70 text-textPrimary p-3 rounded-full transition-all disabled:opacity-30"
        >
          <ChevronLeft size={28} />
        </button>

        <button
          onClick={() => transitionToNextMovie('next')}
          disabled={isTransitioning}
          className="absolute right-4 z-20 bg-surface/50 hover:bg-surface/70 text-textPrimary p-3 rounded-full transition-all disabled:opacity-30"
        >
          <ChevronRight size={28} />
        </button>

        <div
          className={`relative z-10 flex flex-col items-center justify-center space-y-6 px-4 mt-64 max-w-4xl text-center transition-all duration-500 ${
            isTransitioning ? 'opacity-0 transform translate-y-4' : 'opacity-100 transform translate-y-0'
          }`}
        >
          <h1 className="text-textPrimary font-bold text-5xl md:text-6xl drop-shadow-2xl">
            {movie.title}
          </h1>

          <div className="flex items-center gap-4 font-bold text-textPrimary flex-wrap justify-center">
            <div className="flex items-center">
              <Star className="text-star mr-1" fill="currentColor" size={20} />
              <p className="text-star">{movie.rating}</p>
            </div>
            <p>{movie.releaseYear}</p>
            <span className="px-3 py-1 bg-accent text-black text-sm font-bold rounded">HD</span>
          </div>

          {cast.length > 0 && (
            <div className="w-full max-w-2xl">
              <p className="text-textSecond text-sm mb-3 font-semibold tracking-wider">STARRING</p>
              <div className="flex justify-center gap-6 flex-wrap">
                {cast.map((actor, index) => (
                  <div key={index} className="flex flex-col items-center space-y-2 transition-transform hover:scale-110 cursor-pointer">
                    {actor.profile_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                        alt={actor.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-textPrimary/30 shadow-lg hover:border-accent transition-all"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23333" width="100" height="100"/%3E%3Ctext fill="%23666" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-size="40"%3E?%3C/text%3E%3C/svg%3E';
                        }}
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center border-2 border-textPrimary/30 hover:border-accent transition-all">
                        <span className="text-textSecond text-2xl">?</span>
                      </div>
                    )}
                    <p className="text-textPrimary text-xs font-medium text-center max-w-[80px] truncate">
                      {actor.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="text-textPrimary text-lg max-w-2xl line-clamp-3 drop-shadow-lg">
            {movie.description || 'No description available'}
          </p>

          <div className="flex space-x-4">
            <button
              onClick={() => console.log('Navigate to trailer')}
              className="flex items-center space-x-2 bg-surface/70 backdrop-blur border border-border text-textPrimary px-8 py-3 rounded-full font-bold hover:bg-surfaceHover transition-all transform hover:scale-105 shadow-xl"
            >
              <Play size={20} fill="currentColor" />
              <span>Trailer</span>
            </button>

            <button
              onClick={toggleWatchlist}
              disabled={watchlistLoading}
              className={`flex items-center space-x-2 px-8 py-3 rounded-full font-bold transition-all transform hover:scale-105 shadow-xl ${
                inWatchlist ? 'bg-success text-black hover:bg-success/80' : 'bg-accent text-black hover:bg-accentHover'
              }`}
            >
              <Plus size={20} className={inWatchlist ? 'rotate-45' : ''} />
              <span>{watchlistLoading ? '...' : inWatchlist ? 'Added to Shelf' : 'Save for Later'}</span>
            </button>
          </div>
        </div>
      </section>

      {/*SHELF + BROWSE GRID */}
      <div className="max-w-6xl mx-auto px-6 md:px-8 py-12 space-y-16">
        <ShelfSection
          user={user}
          shelfItems={shelfItems}
          shelfLoading={shelfLoading}
          onNavigateLogin={() => navigate('/login')}
          onCardClick={goToDetails}
          onRemove={handleRemoveFromShelf}
        />

        <BrowseSection
          allMovies={allMovies}
          onCardClick={goToDetails}
          onAdd={handleAddToShelf}
        />
      </div>
    </div>
  );
}