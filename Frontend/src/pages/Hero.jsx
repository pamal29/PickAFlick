import React, { useState, useEffect } from 'react';
import {
  Play,
  Star,
  Plus,
  ChevronLeft,
  ChevronRight,
  Info,
  Film,
  Bookmark,
  Sparkles,
  CalendarDays,
  Clapperboard,
  X,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useWatchlist } from '../hooks/useWatchlist';
import ShelfSection from '../components/ShelfSection';
import BrowseSection from '../components/BrowseSection';
import LoginRequiredModal from '../components/LoginRequiredModal';

export default function Hero() {
  // Featured movie carousel
  const [movie, setMovie] = useState(null);
  const [nextMovie, setNextMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [cast, setCast] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [allMovies, setAllMovies] = useState([]);
  const [inWatchlist, setInWatchlist] = useState(false);

  // Trailer modal
  const [showTrailer, setShowTrailer] = useState(false);
  const [trailerKey, setTrailerKey] = useState(null);
  const [trailerLoading, setTrailerLoading] = useState(false);

  // Watchlist
  const [shelfItems, setShelfItems] = useState([]);
  const [shelfLoading, setShelfLoading] = useState(true);

  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const {
    checkInWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    loading: watchlistLoading,
    showLoginModal,
    setShowLoginModal,
  } = useWatchlist(user, profile);

  // Check whether the featured movie is saved
  useEffect(() => {
    let cancelled = false;

    async function checkSavedStatus() {
      if (!movie) return;

      try {
        const saved = await checkInWatchlist(movie.id);

        if (!cancelled) {
          setInWatchlist(Boolean(saved));
        }
      } catch (err) {
        console.error('Error checking watchlist:', err);
      }
    }

    checkSavedStatus();

    return () => {
      cancelled = true;
    };
  }, [movie, user]);

  // Fetch the featured movie collection
  const fetchAllMovies = async () => {
    try {
      const response = await fetch(
        'http://localhost:3001/api/hero/all'
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      setAllMovies(data);

      if (data.length > 0) {
        setMovie(data[0]);
        setNextMovie(data[1] || data[0]);
        setCurrentIndex(0);
        fetchCast(data[0].id);
      }
    } catch (err) {
      console.error('Error fetching movies:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch cast details
  const fetchCast = async (movieId) => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/movie/${movieId}/credits`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch cast');
      }

      const data = await response.json();
      setCast(data.cast?.slice(0, 5) || []);
    } catch (err) {
      console.error('Error fetching cast:', err);
      setCast([]);
    }
  };

  // Change featured movie
  const transitionToNextMovie = (direction = 'next') => {
    if (isTransitioning || allMovies.length === 0) return;

    setIsTransitioning(true);

    const newIndex =
      direction === 'next'
        ? (currentIndex + 1) % allMovies.length
        : currentIndex === 0
          ? allMovies.length - 1
          : currentIndex - 1;

    const newMovie = allMovies[newIndex];
    const upcomingMovie = allMovies[
      (newIndex + 1) % allMovies.length
    ];

    fetchCast(newMovie.id);

    setTimeout(() => {
      setMovie(newMovie);
      setNextMovie(upcomingMovie);
      setCurrentIndex(newIndex);
      setIsTransitioning(false);
    }, 300);
  };

  useEffect(() => {
    fetchAllMovies();
  }, []);

  // Automatically rotate featured movies
  useEffect(() => {
    if (allMovies.length < 2) return;

    const interval = setInterval(() => {
      transitionToNextMovie('next');
    }, 10000);

    return () => clearInterval(interval);
  }, [currentIndex, allMovies, isTransitioning]);

  // Fetch saved shelf
  useEffect(() => {
    let cancelled = false;

    async function fetchShelf() {
      setShelfLoading(true);

      if (!user) {
        setShelfItems([]);
        setShelfLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:3001/api/watchlist/${user.id}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch watchlist');
        }

        const data = await response.json();

        if (!cancelled) {
          setShelfItems(
            data.map((row) => ({
              ...row,
              id: row.movie_id,
            }))
          );
        }
      } catch (err) {
        console.error('Error fetching shelf:', err);

        if (!cancelled) {
          setShelfItems([]);
        }
      } finally {
        if (!cancelled) {
          setShelfLoading(false);
        }
      }
    }

    fetchShelf();

    return () => {
      cancelled = true;
    };
  }, [user]);

  // Add or remove featured movie from shelf
  const toggleWatchlist = async () => {
    if (!movie || watchlistLoading) return;

    if (inWatchlist) {
      await removeFromWatchlist(movie);
      setInWatchlist(false);

      setShelfItems((prev) =>
        prev.filter((item) => item.id !== movie.id)
      );
    } else {
      const result = await addToWatchlist(movie);

      if (result) {
        setInWatchlist(true);

        setShelfItems((prev) => {
          const newItems = Array.isArray(result) ? result : [result];

          const normalized = newItems.map((item) => ({
            ...item,
            id: item.movie_id ?? item.id,
          }));

          const existingIds = new Set(prev.map((item) => item.id));

          return [
            ...prev,
            ...normalized.filter((item) => !existingIds.has(item.id)),
          ];
        });
      }
    }
  };

  // Add an item from Browse
  const handleAddToShelf = async (item) => {
    const result = await addToWatchlist(item);

    if (result) {
      const newItems = Array.isArray(result) ? result : [result];

      setShelfItems((prev) => {
        const normalized = newItems.map((saved) => ({
          ...saved,
          id: saved.movie_id ?? saved.id,
        }));

        const existingIds = new Set(prev.map((saved) => saved.id));

        return [
          ...prev,
          ...normalized.filter((saved) => !existingIds.has(saved.id)),
        ];
      });
    }
  };

  // Remove an item from shelf
  const handleRemoveFromShelf = async (item) => {
    if (!user) return;

    await removeFromWatchlist(item);

    setShelfItems((prev) =>
      prev.filter((saved) => saved.id !== item.id)
    );

    if (movie && movie.id === item.id) {
      setInWatchlist(false);
    }
  };

  // Open movie details
  const goToDetails = (item) => {
    const path =
      item.type === 'tv'
        ? `/tv/${item.id}`
        : `/movie/${item.id}`;

    navigate(path);
  };

  // Play trailer
  const handlePlayTrailer = async () => {
    if (!movie) return;

    setTrailerLoading(true);
    setShowTrailer(true);
    setTrailerKey(null);

    try {
      const response = await fetch(
        `http://localhost:3001/api/movie/${movie.id}/videos`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch trailer');
      }

      const data = await response.json();
      setTrailerKey(data.key || null);
    } catch (err) {
      console.error('Error fetching trailer:', err);
      setTrailerKey(null);
    } finally {
      setTrailerLoading(false);
    }
  };

  const closeTrailer = () => {
    setShowTrailer(false);
    setTrailerKey(null);
  };

  // Loading state
  if (loading) {
    return (
      <section className="min-h-screen bg-[#08090d] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-2 border-violet-500/20 border-t-violet-500 animate-spin mx-auto mb-5" />
          <p className="text-white text-lg font-semibold">
            Preparing your next watch
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Discovering movies and shows...
          </p>
        </div>
      </section>
    );
  }

  // Error state
  if (error || !movie) {
    return (
      <section className="min-h-screen bg-[#08090d] flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <Film size={44} className="mx-auto mb-5 text-violet-400" />

          <h2 className="text-white text-2xl font-bold mb-3">
            Unable to load movies
          </h2>

          <p className="text-gray-400 mb-6">
            {error || 'No featured movies are available right now.'}
          </p>

          <button
            onClick={() => {
              setError(null);
              setLoading(true);
              fetchAllMovies();
            }}
            className="px-6 py-3 rounded-xl bg-violet-500 text-white font-semibold hover:bg-violet-400 transition"
          >
            Try again
          </button>
        </div>
      </section>
    );
  }

  return (
    <div className="min-h-screen bg-[#08090d] text-white">
      {/* FEATURED MOVIE */}
      <section className="relative isolate overflow-hidden">
        {/* Cinematic background */}
        <div className="absolute inset-0 -z-20">
          {movie.backdrop && (
            <img
              src={movie.backdrop}
              alt=""
              className={`w-full h-full object-cover object-center transition-all duration-700 ${
                isTransitioning ? 'scale-105 opacity-30' : 'scale-100 opacity-60'
              }`}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          )}
        </div>

        {/* Dark overlays for readability */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#08090d] via-[#08090d]/90 to-[#08090d]/45" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#08090d] via-transparent to-[#08090d]/40" />

        {/* Hero content */}
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 pt-10 sm:pt-14 lg:pt-16 pb-10 lg:pb-16 min-h-[780px] lg:min-h-[720px]">
          {/* Section label */}
          <div className="flex items-center gap-2 mb-8">
            <Sparkles size={16} className="text-violet-400" />
            <span className="text-xs uppercase tracking-[0.25em] text-violet-300 font-bold">
              Your next obsession
            </span>
            <span className="h-px w-12 bg-violet-500/50" />
            <span className="text-xs text-gray-400">
              Featured pick
            </span>
          </div>

          <div
            className={`grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_310px] xl:grid-cols-[minmax(0,1fr)_350px] gap-10 lg:gap-14 items-start transition-all duration-300 ${
              isTransitioning
                ? 'opacity-50 translate-y-2'
                : 'opacity-100 translate-y-0'
            }`}
          >
            {/* LEFT: Main movie information */}
            <div className="max-w-3xl flex flex-col lg:min-h-[560px]">
              {/* Type label */}
              <div className="flex flex-wrap items-center gap-3 mb-5">
                <span className="inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-violet-300">
                  <Clapperboard size={14} />
                  Editor's pick
                </span>

                <span className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
                  {movie.type === 'tv' ? 'TV Series' : 'Movie'}
                </span>

                <span className="h-1 w-1 rounded-full bg-gray-600" />

                <span className="text-xs font-semibold text-gray-400">
                  HD
                </span>
              </div>

              {/* Movie title */}
              <h1 className="max-w-3xl text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black leading-[1.05] tracking-tight text-white [text-shadow:0_4px_30px_rgba(0,0,0,0.35)]">
                {movie.title}
              </h1>

              {/* Metadata */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-3 mt-6 text-sm">
                <span className="inline-flex items-center gap-1.5 text-amber-400 font-bold">
                  <Star size={17} fill="currentColor" />
                  {movie.rating ?? 'N/A'}
                </span>

                <span className="inline-flex items-center gap-2 text-gray-300">
                  <CalendarDays size={15} className="text-gray-500" />
                  {movie.releaseYear || 'Year unavailable'}
                </span>

                <span className="rounded-md border border-white/15 bg-white/5 px-2.5 py-1 text-xs font-semibold text-gray-300">
                  {movie.type === 'tv' ? 'SERIES' : 'FEATURE FILM'}
                </span>
              </div>

              {/* Overview */}
              <div className="mt-7 max-w-2xl">
                <p className="text-sm sm:text-base leading-7 text-gray-300 line-clamp-4">
                  {movie.description || 'No description is available for this title.'}
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-3 mt-8">
                <button
                  onClick={handlePlayTrailer}
                  className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-violet-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-violet-950/30 transition hover:bg-violet-400 hover:-translate-y-0.5"
                >
                  <Play size={18} fill="currentColor" />
                  Watch trailer
                </button>

                <button
                  onClick={toggleWatchlist}
                  disabled={watchlistLoading}
                  className={`inline-flex items-center justify-center gap-2.5 rounded-xl border px-5 py-3.5 text-sm font-bold transition hover:-translate-y-0.5 disabled:opacity-50 ${
                    inWatchlist
                      ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                      : 'border-white/15 bg-white/[0.06] text-white hover:bg-white/10'
                  }`}
                >
                  {inWatchlist ? (
                    <Bookmark size={17} fill="currentColor" />
                  ) : (
                    <Plus size={19} />
                  )}

                  {watchlistLoading
                    ? 'Please wait...'
                    : inWatchlist
                      ? 'Saved to shelf'
                      : 'Add to my shelf'}
                </button>

                <button
                  onClick={() => goToDetails(movie)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-semibold text-gray-300 transition hover:text-white"
                >
                  <Info size={17} />
                  Details
                </button>
              </div>

              {/* Carousel controls */}
              <div className="flex items-center gap-4 mt-10 lg:mt-auto lg:pt-10">
                <button
                  onClick={() => transitionToNextMovie('prev')}
                  disabled={isTransitioning || allMovies.length < 2}
                  aria-label="Previous featured movie"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] text-white transition hover:bg-violet-500 hover:border-violet-500 disabled:opacity-30"
                >
                  <ChevronLeft size={20} />
                </button>

                <div className="flex items-center gap-1.5">
                  {allMovies.slice(0, Math.min(allMovies.length, 8)).map((item, index) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (index === currentIndex || isTransitioning) return;

                        setIsTransitioning(true);

                        setTimeout(() => {
                          setMovie(allMovies[index]);
                          setNextMovie(
                            allMovies[(index + 1) % allMovies.length]
                          );
                          setCurrentIndex(index);
                          fetchCast(allMovies[index].id);
                          setIsTransitioning(false);
                        }, 300);
                      }}
                      aria-label={`Show ${item.title}`}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        index === currentIndex
                          ? 'w-8 bg-violet-400'
                          : 'w-2 bg-white/25 hover:bg-white/50'
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={() => transitionToNextMovie('next')}
                  disabled={isTransitioning || allMovies.length < 2}
                  aria-label="Next featured movie"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] text-white transition hover:bg-violet-500 hover:border-violet-500 disabled:opacity-30"
                >
                  <ChevronRight size={20} />
                </button>

                <span className="ml-1 text-xs font-medium tracking-widest text-gray-500">
                  {String(currentIndex + 1).padStart(2, '0')} /{' '}
                  {String(allMovies.length).padStart(2, '0')}
                </span>
              </div>
            </div>

            {/* RIGHT: Movie details panel */}
            <aside className="w-full max-w-lg mx-auto lg:max-w-none lg:-mt-8 xl:-mt-12">
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#11121a]/80 p-5 sm:p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
                {/* Panel heading */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-gray-500 font-bold">
                      At a glance
                    </p>
                    <h2 className="text-lg font-bold text-white mt-1">
                      Movie details
                    </h2>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10">
                    <Film size={19} className="text-violet-300" />
                  </div>
                </div>

                {/* Featured image */}
                <div className="relative mb-5 overflow-hidden rounded-xl border border-white/10">
                  {movie.backdrop ? (
                    <img
                      src={movie.backdrop}
                      alt={movie.title}
                      className="h-40 sm:h-44 w-full object-cover"
                    />
                  ) : (
                    <div className="h-40 sm:h-44 w-full bg-gradient-to-br from-violet-950 to-gray-900 flex items-center justify-center">
                      <Film size={36} className="text-violet-300/50" />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="text-xs uppercase tracking-wider text-violet-300 font-bold">
                      Now spotlighting
                    </p>
                    <p className="mt-1 text-white font-bold line-clamp-1">
                      {movie.title}
                    </p>
                  </div>
                </div>

                {/* Detail rows */}
                <div className="space-y-0">
                  <div className="flex items-center justify-between gap-3 py-3 border-b border-white/[0.07]">
                    <span className="text-sm text-gray-400">Release year</span>
                    <span className="text-sm font-semibold text-white">
                      {movie.releaseYear || 'Not available'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3 py-3 border-b border-white/[0.07]">
                    <span className="text-sm text-gray-400">TMDB rating</span>
                    <span className="inline-flex items-center gap-1.5 text-sm font-bold text-amber-400">
                      <Star size={14} fill="currentColor" />
                      {movie.rating ?? 'N/A'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3 py-3 border-b border-white/[0.07]">
                    <span className="text-sm text-gray-400">Format</span>
                    <span className="text-sm font-semibold text-white">
                      {movie.type === 'tv' ? 'TV Series' : 'Movie'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3 py-3">
                    <span className="text-sm text-gray-400">Your shelf</span>
                    <span className={`text-xs font-bold rounded-full px-2.5 py-1 ${
                      inWatchlist
                        ? 'bg-emerald-400/10 text-emerald-300'
                        : 'bg-white/[0.06] text-gray-400'
                    }`}>
                      {inWatchlist ? 'SAVED' : 'NOT SAVED'}
                    </span>
                  </div>
                </div>

                {/* Cast */}
                <div className="mt-5 pt-5 border-t border-white/[0.08]">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-white">
                      Top cast
                    </h3>
                    <span className="text-xs text-gray-500">
                      {cast.length} people
                    </span>
                  </div>

                  {cast.length > 0 ? (
                    <div className="space-y-3">
                      {cast.slice(0, 4).map((actor, index) => (
                        <div
                          key={actor.id || index}
                          className="flex items-center gap-3"
                        >
                          {actor.profile_path ? (
                            <img
                              src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                              alt={actor.name}
                              className="h-10 w-10 rounded-full object-cover border border-white/10 bg-white/5"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-white/[0.06] flex items-center justify-center text-sm font-bold text-gray-400">
                              {actor.name?.charAt(0) || '?'}
                            </div>
                          )}

                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-200 truncate">
                              {actor.name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {actor.character || 'Cast member'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      Cast information is unavailable.
                    </p>
                  )}
                </div>

                {/* Panel footer */}
                <div className="mt-6 rounded-xl border border-violet-400/15 bg-violet-500/[0.06] p-3.5">
                  <div className="flex items-start gap-3">
                    <Sparkles
                      size={17}
                      className="mt-0.5 shrink-0 text-violet-300"
                    />
                    <div>
                      <p className="text-sm font-semibold text-white">
                        Discover your next favorite
                      </p>
                      <p className="mt-1 text-xs leading-5 text-gray-400">
                        Explore the collection and save titles to your personal shelf.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* MOVIE SHELVES AND BROWSE */}
      <main className="relative max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 pb-16">
        {/* Section introduction */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-5 w-1 rounded-full bg-violet-400" />
              <span className="text-xs uppercase tracking-[0.2em] font-bold text-violet-300">
                Your collection
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Your movie universe
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Keep track of what you love and find something new.
            </p>
          </div>
        </div>

        {/* Existing components are preserved */}
        <div className="space-y-12 sm:space-y-16">
          <ShelfSection
            user={user}
            shelfItems={shelfItems}
            shelfLoading={shelfLoading}
            onNavigateLogin={() => navigate('/login')}
            onCardClick={goToDetails}
            onRemove={handleRemoveFromShelf}
          />

          <BrowseSection
            onCardClick={goToDetails}
            onAdd={handleAddToShelf}
          />
        </div>
      </main>

      {/* TRAILER MODAL */}
      {showTrailer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          onClick={closeTrailer}
        >
          <div
            className="relative w-full max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-[#11121a] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <div>
                <p className="text-xs uppercase tracking-widest text-violet-300 font-bold">
                  Now playing
                </p>
                <h3 className="mt-1 text-base sm:text-lg font-bold text-white">
                  {movie.title} — Trailer
                </h3>
              </div>

              <button
                onClick={closeTrailer}
                aria-label="Close trailer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.06] text-gray-300 transition hover:bg-white/10 hover:text-white"
              >
                <X size={19} />
              </button>
            </div>

            <div className="aspect-video w-full">
              {trailerLoading ? (
                <div className="flex h-full items-center justify-center">
                  <div className="h-10 w-10 animate-spin rounded-full border-2 border-violet-500/20 border-t-violet-400" />
                </div>
              ) : trailerKey ? (
                <iframe
                  className="h-full w-full"
                  src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`}
                  title={`${movie.title} trailer`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center px-5 text-center">
                  <Film size={36} className="mb-4 text-gray-600" />
                  <p className="text-white font-semibold">
                    No trailer available
                  </p>
                  <p className="mt-2 text-sm text-gray-500">
                    We couldn't find a trailer for this title.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* LOGIN REQUIRED MODAL */}
      {showLoginModal && (
        <LoginRequiredModal
          onClose={() => setShowLoginModal(false)}
        />
      )}
    </div>
  );
}
