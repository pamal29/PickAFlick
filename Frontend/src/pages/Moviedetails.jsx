import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Star, Calendar, Clock, Film } from "lucide-react";

export default function Moviedetails() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchMovie() {
      try {
        console.log(`🔍 Fetching movie ID: ${id}`);
        const res = await fetch(`http://localhost:3001/api/movie/${id}`);

        if (!res.ok) {
          throw new Error("Failed to fetch movie");
        }

        const data = await res.json();
        console.log("✅ Movie loaded:", data.title);
        setMovie(data);
      } catch (err) {
        console.error("❌ Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchMovie();
  }, [id]);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if(!userId ||!movie) return;

    fetch(`http://localhost:3001/api/watchlist/${userId}/${movie.id}`)
      .then((res) => res.json())
      .then((data) => setInWatchlist(data.inWatchlist));
  }, [movie]);

  const handleSave = async () => {
    const userId = localStorage.getItem('userId');
    const username = localStorage.getItem('username');
    if (!userId) {
      // no user logged in — decide: redirect to /login, or just return
      return;
    }

    setSaving(true);
    await fetch('http://localhost:3001/api/watchlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        username,
        movieId: movie.id,       
        title: movie.title,      
        poster: movie.poster,    
        type: 'movie'           
      })
    });
    setInWatchlist(true);
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-accent mx-auto mb-4"></div>
          <div className="text-textPrimary text-xl">Loading movie...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-danger text-xl mb-2">Error: {error}</div>
          <div className="text-textSecond">Make sure your backend server is running</div>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center">
        <div className="text-textSecond text-xl">Movie not found</div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen text-textPrimary">
      {/* Backdrop banner */}
      <div className="relative w-full h-[45vh] overflow-hidden">
        {movie.backdrop && (
          <img
            src={movie.backdrop}
            alt={movie.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/20" />
      </div>

      <div className="max-w-5xl mx-auto px-6 md:px-8 -mt-40 relative z-10 pb-16">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <img
            src={movie.poster}
            alt={movie.title}
            className="w-56 md:w-72 h-auto rounded-xl shadow-2xl object-cover border border-border flex-shrink-0"
            onError={(e) => {
              e.target.src =
                "https://via.placeholder.com/300x450/15151F/ffffff?text=No+Image";
            }}
          />

          {/* Details */}
          <div className="flex-1 pt-2 md:pt-32">
            <h1 className="text-3xl md:text-5xl font-bold mb-3 drop-shadow-xl">
              {movie.title}
            </h1>

            {movie.tagline && (
              <p className="italic text-textSecond mb-4">"{movie.tagline}"</p>
            )}

            {/* Info row */}
            <div className="flex flex-wrap items-center gap-4 mb-5">
              <div className="flex items-center gap-1 bg-surface px-3 py-1.5 rounded-full border border-border">
                <Star className="text-star" fill="currentColor" size={16} />
                <span className="font-bold text-star">{movie.rating}</span>
                <span className="text-textMuted text-sm">/10</span>
              </div>

              <div className="flex items-center gap-1.5 text-textSecond text-sm">
                <Calendar size={16} />
                {movie.releaseYear}
              </div>

              {movie.status && (
                <span className="px-3 py-1 bg-accent/15 text-accent text-xs font-bold rounded-full border border-accent/30 uppercase tracking-wide">
                  {movie.status}
                </span>
              )}
            </div>

            {/* Genre pills */}
            {movie.genres && movie.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {movie.genres.map((genre, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-surface text-textSecond text-sm rounded-full border border-border hover:border-accent hover:text-accent transition-colors cursor-default"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}

            {/* Runtime card */}
            {movie.runtime && (
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-2 bg-surface px-4 py-3 rounded-lg border border-border">
                  <Clock className="text-secondary" size={20} />
                  <div>
                    <p className="text-textPrimary font-bold leading-none">
                      {movie.runtime} min
                    </p>
                    <p className="text-textMuted text-xs mt-0.5">Runtime</p>
                  </div>
                </div>
              </div>
            )}

            {/* Overview */}
            <div>
              <h2 className="text-textSecond text-sm font-semibold tracking-wider uppercase mb-2">
                Overview
              </h2>
              <p className="text-lg leading-relaxed text-textPrimary/90">
                {movie.overview || "No description available."}
              </p>
            </div>

            {/* Save button */}
           <button
            onClick={handleSave}
            disabled={saving || inWatchlist}
            className="mt-8 flex items-center gap-2 bg-accent text-black px-8 py-3 rounded-full font-bold hover:bg-accentHover transition-all transform hover:scale-105 shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {inWatchlist ? 'Saved ✓' : saving ? 'Saving...' : 'Save for Later'}
          </button>
          </div>
        </div>
      </div>
    </div>
  );
}