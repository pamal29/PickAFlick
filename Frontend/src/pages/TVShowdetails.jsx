import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Star, Calendar, Tv, Clock, PlayCircle } from "lucide-react";

export default function TVShowdetails() {
  const { id } = useParams();
  const [show, setShow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchShow() {
      try {
        console.log(`🔍 Fetching TV show ID: ${id}`);
        const res = await fetch(`http://localhost:3001/api/tv/${id}`);

        if (!res.ok) {
          throw new Error("Failed to fetch TV show");
        }

        const data = await res.json();
        console.log("✅ TV show loaded:", data.title);
        setShow(data);
      } catch (err) {
        console.error("❌ Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchShow();
  }, [id]);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId || !show) return; 

    fetch(`http://localhost:3001/api/watchlist/${userId}/check/${show.id}`)
      .then(res => res.json())
      .then(data => setInWatchlist(data.inWatchlist));
  }, [show]);

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
        movieId: show.id,       
        title: show.title,      
        poster: show.poster,    
        type: 'tv'            
      })
    });
    setInWatchlist(true);
    setSaving(false);
  };

  const handleRemove = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    setSaving(true);
    await fetch(`http://localhost:3001/api/watchlist/${userId}/${show.id}`, {
      method: 'DELETE'
    });
    setInWatchlist(false);
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-accent mx-auto mb-4"></div>
          <div className="text-textPrimary text-xl">Loading TV show...</div>
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

  if (!show) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center">
        <div className="text-textSecond text-xl">TV show not found</div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen text-textPrimary">
      {/* Backdrop banner */}
      <div className="relative w-full h-[45vh] overflow-hidden">
        {show.backdrop && (
          <img
            src={show.backdrop}
            alt={show.title}
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
            src={show.poster}
            alt={show.title}
            className="w-56 md:w-72 h-auto rounded-xl shadow-2xl object-cover border border-border flex-shrink-0"
            onError={(e) => {
              e.target.src =
                "https://via.placeholder.com/300x450/15151F/ffffff?text=No+Image";
            }}
          />

          {/* Details */}
          <div className="flex-1 pt-2 md:pt-32">
            <h1 className="text-3xl md:text-5xl font-bold mb-3 drop-shadow-xl">
              {show.title}
            </h1>

            {show.tagline && (
              <p className="italic text-textSecond mb-4">"{show.tagline}"</p>
            )}

            {/* Info row */}
            <div className="flex flex-wrap items-center gap-4 mb-5">
              <div className="flex items-center gap-1 bg-surface px-3 py-1.5 rounded-full border border-border">
                <Star className="text-star" fill="currentColor" size={16} />
                <span className="font-bold text-star">{show.rating}</span>
                <span className="text-textMuted text-sm">/10</span>
              </div>

              <div className="flex items-center gap-1.5 text-textSecond text-sm">
                <Calendar size={16} />
                {show.releaseYear}
              </div>

              {show.status && (
                <span className="px-3 py-1 bg-accent/15 text-accent text-xs font-bold rounded-full border border-accent/30 uppercase tracking-wide">
                  {show.status}
                </span>
              )}
            </div>

            {/* Genre pills */}
            {show.genres && show.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {show.genres.map((genre, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-surface text-textSecond text-sm rounded-full border border-border hover:border-accent hover:text-accent transition-colors cursor-default"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}

            {/* Seasons / Episodes cards */}
            {(show.numberOfSeasons || show.numberOfEpisodes) && (
              <div className="flex flex-wrap gap-4 mb-6">
                {show.numberOfSeasons && (
                  <div className="flex items-center gap-2 bg-surface px-4 py-3 rounded-lg border border-border">
                    <Tv className="text-secondary" size={20} />
                    <div>
                      <p className="text-textPrimary font-bold leading-none">
                        {show.numberOfSeasons}
                      </p>
                      <p className="text-textMuted text-xs mt-0.5">Seasons</p>
                    </div>
                  </div>
                )}
                {show.numberOfEpisodes && (
                  <div className="flex items-center gap-2 bg-surface px-4 py-3 rounded-lg border border-border">
                    <PlayCircle className="text-secondary" size={20} />
                    <div>
                      <p className="text-textPrimary font-bold leading-none">
                        {show.numberOfEpisodes}
                      </p>
                      <p className="text-textMuted text-xs mt-0.5">Episodes</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Overview */}
            <div>
              <h2 className="text-textSecond text-sm font-semibold tracking-wider uppercase mb-2">
                Overview
              </h2>
              <p className="text-lg leading-relaxed text-textPrimary/90">
                {show.overview || "No description available."}
              </p>
            </div>

            {/* Save button */}
            <button
              onClick={inWatchlist ? handleRemove : handleSave}
              disabled={saving}
              className={`mt-8 flex items-center gap-2 px-8 py-3 rounded-full font-bold transition-all transform hover:scale-105 shadow-xl disabled:opacity-60 disabled:cursor-not-allowed ${
                inWatchlist
                  ? 'bg-danger text-white hover:bg-danger/80'
                  : 'bg-accent text-black hover:bg-accentHover'
              }`}
            >
              {saving ? 'Saving...' : inWatchlist ? 'Remove from List' : 'Save for Later'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}