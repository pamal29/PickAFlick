import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

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
        
        const formattedImages = data.map(show => ({
          id: show.id,
          url: show.poster,
          title: show.title,
          rating: show.rating,
          year: show.releaseYear,
          type: 'tv'
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
        
        const formattedImages = data.map(movie => ({
          id: movie.id,
          url: movie.poster,
          title: movie.title,
          rating: movie.rating,
          year: movie.releaseYear,
          type: 'movie'
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

  // Show loading state
  if (loading) {
    return (
      <div className="bg-black py-12">
        <h2 className="text-4xl font-bold text-white ml-8 mb-8">
          Loading Content...
        </h2>
        <p className="text-center text-gray-400 text-lg">Fetching trending shows and movies...</p>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="bg-black py-12">
        <h2 className="text-4xl font-bold text-white ml-8 mb-8">
          Error Loading Content
        </h2>
        <p className="text-center text-red-500">⚠️ {error}</p>
        <p className="text-center text-gray-400 mt-2">Make sure your backend server is running on port 3001</p>
      </div>
    );
  }

  // Triple the arrays for seamless looping
  const triplicatedSeries = [...seriesImages, ...seriesImages, ...seriesImages];
  const triplicatedMovies = [...movieImages, ...movieImages, ...movieImages];

  return (
    <>
      {/* TV Shows Section */}
      <div className="bg-black py-12 overflow-hidden">
        <h2 className="text-4xl font-bold text-white ml-8 mb-8">
          Trending TV Shows
        </h2>

        <div className="relative">
          <div className="flex gap-6 animate-scroll">
            {triplicatedSeries.map((image, index) => (
              <Link
                to={`/${image.type}/${image.id}`}
                target="_blank"
                rel="noopener noreferrer"
                key={`series-${image.id}-${index}`}
                className="relative flex-shrink-0 w-64 h-96 rounded-xl overflow-hidden shadow-lg hover:scale-105 transition-transform duration-300 cursor-pointer"
              >
                <img
                  src={image.url}
                  alt={image.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/300x450/1f2937/ffffff?text=No+Image";
                  }}
                />

                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4">
                  <h3 className="text-white font-semibold text-lg truncate">
                    {image.title}
                  </h3>
                  <p className="text-gray-300 text-sm">
                    ⭐ {image.rating} • {image.year}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-black to-transparent pointer-events-none"></div>
          <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-black to-transparent pointer-events-none"></div>
        </div>
      </div>

      {/* Movies Section */}
      <div className="bg-black py-12 overflow-hidden">
        <h2 className="text-4xl font-bold text-white ml-8 mb-8">
          Trending Movies
        </h2>

        <div className="relative">
          <div className="flex gap-6 animate-scroll-reverse">
            {triplicatedMovies.map((image, index) => (
              <Link
                to={`/${image.type}/${image.id}`}
                target="_blank"
                rel="noopener noreferrer"
                key={`movie-${image.id}-${index}`}
                className="relative flex-shrink-0 w-64 h-96 rounded-xl overflow-hidden shadow-lg hover:scale-105 transition-transform duration-300 cursor-pointer"
              >
                <img
                  src={image.url}
                  alt={image.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/300x450/1f2937/ffffff?text=No+Image";
                  }}
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4">
                  <h3 className="text-white font-semibold text-lg truncate">
                    {image.title}
                  </h3>
                  <p className="text-gray-300 text-sm">
                    ⭐ {image.rating} • {image.year}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-black to-transparent pointer-events-none"></div>
          <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-black to-transparent pointer-events-none"></div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-100% / 3));
          }
        }

        @keyframes scrollReverse {
          0% {
            transform: translateX(calc(-100% / 3));
          }
          100% {
            transform: translateX(0);
          }
        }

        .animate-scroll {
          animation: scroll 60s linear infinite;
        }

        .animate-scroll:hover {
          animation-play-state: paused;
        }

        .animate-scroll-reverse {
          animation: scrollReverse 60s linear infinite;
        }

        .animate-scroll-reverse:hover {
          animation-play-state: paused;
        }
      `}</style>
    </>
  );
}