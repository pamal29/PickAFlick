import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Star } from "lucide-react";

export default function Trending() {
  const [seriesImages, setSeriesImages] = useState([]);
  const [movieImages, setMovieImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchTrendingSeries() {
      try {
        console.log("🔍 Fetching trending shows...");
        const res = await fetch("http://localhost:3001/api/trending");

        if (!res.ok) {
          throw new Error(`Failed to fetch series: ${res.status}`);
        }

        const data = await res.json();
        console.log("✅ Received", data.length, "shows");

        const formattedImages = data.map((show) => ({
          id: show.id,
          url: show.poster,
          title: show.title,
          rating: show.rating,
          year: show.releaseYear,
          type: "tv",
        }));

        setSeriesImages(formattedImages);
      } catch (err) {
        console.error("❌ Series Error:", err);
        setError(err.message);
      }
    }

    async function fetchTrendingMovies() {
      try {
        console.log("🔍 Fetching trending movies...");
        const res = await fetch("http://localhost:3001/api/trending-movies");

        if (!res.ok) {
          throw new Error(`Failed to fetch movies: ${res.status}`);
        }

        const data = await res.json();
        console.log("✅ Received", data.length, "movies");

        const formattedImages = data.map((movie) => ({
          id: movie.id,
          url: movie.poster,
          title: movie.title,
          rating: movie.rating,
          year: movie.releaseYear,
          type: "movie",
        }));

        setMovieImages(formattedImages);
      } catch (err) {
        console.error("❌ Movies Error:", err);
        setError(err.message);
      }
    }

    async function fetchAll() {
      await Promise.all([fetchTrendingSeries(), fetchTrendingMovies()]);
      setLoading(false);
    }

    fetchAll();
  }, []);

  if (loading) {
    return (
      <div className="bg-black py-12">
        <h2 className="text-4xl font-bold text-textPrimary ml-8 mb-8">
          Loading Content...
        </h2>
        <p className="text-center text-textSecond text-lg">
          Fetching trending shows and movies...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-black py-12">
        <h2 className="text-4xl font-bold text-textPrimary ml-8 mb-8">
          Error Loading Content
        </h2>
        <p className="text-center text-danger">⚠️ {error}</p>
        <p className="text-center text-textSecond mt-2">
          Make sure your backend server is running on port 3001
        </p>
      </div>
    );
  }

  // Triple the arrays for seamless looping
  const triplicatedSeries = [...seriesImages, ...seriesImages, ...seriesImages];
  const triplicatedMovies = [...movieImages, ...movieImages, ...movieImages];

  return (
    <>
      {/* TV Shows Section */}
      <RankedRow
        title="Trending TV Shows"
        items={triplicatedSeries}
        originalLength={seriesImages.length}
        keyPrefix="series"
      />

      {/* Movies Section */}
      <RankedRow
        title="Trending Movies"
        items={triplicatedMovies}
        originalLength={movieImages.length}
        keyPrefix="movie"
      />

      <style jsx global>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-100% / 3));
          }
        }

        .animate-scroll {
          animation: scroll 60s linear infinite;
        }

        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </>
  );
}

function RankedRow({ title, items, originalLength, keyPrefix }) {
  return (
    <div className="bg-black py-12 overflow-hidden">
      <h2 className="text-4xl font-bold text-textPrimary ml-8 mb-8">{title}</h2>

      <div className="relative">
        <div className="flex gap-8 animate-scroll pl-8">
          {items.map((image, index) => {
            const rank = originalLength > 0 ? (index % originalLength) + 1 : index + 1;
            const isTop3 = rank <= 3;

            return (
              <Link
                to={`/${image.type}/${image.id}`}
                target="_blank"
                rel="noopener noreferrer"
                key={`${keyPrefix}-${image.id}-${index}`}
                className="relative flex-shrink-0 flex items-end group"
              >
                {/* Rank number */}
                <span
                  className={`select-none font-black leading-none mr-[-1.5rem] z-0 transition-colors ${
                    isTop3 ? "text-accent" : "text-surfaceHover"
                  }`}
                  style={{
                    fontSize: "9rem",
                    WebkitTextStroke: isTop3 ? "none" : "2px #2A2A3D",
                    color: isTop3 ? undefined : "transparent",
                  }}
                >
                  {rank}
                </span>

                {/* Poster card */}
                <div className="relative w-56 h-80 rounded-xl overflow-hidden shadow-lg border border-border group-hover:scale-105 group-hover:border-accent transition-all duration-300 z-10">
                  <img
                    src={image.url}
                    alt={image.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/300x450/15151F/ffffff?text=No+Image";
                    }}
                  />

                  {isTop3 && (
                    <span className="absolute top-2 right-2 bg-accent text-black text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wide">
                      Hot
                    </span>
                  )}

                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4">
                    <h3 className="text-textPrimary font-semibold text-lg truncate">
                      {image.title}
                    </h3>
                    <p className="text-textSecond text-sm flex items-center gap-1">
                      <Star className="text-star" fill="currentColor" size={14} />
                      {image.rating} • {image.year}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-black to-transparent pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-black to-transparent pointer-events-none"></div>
      </div>
    </div>
  );
}