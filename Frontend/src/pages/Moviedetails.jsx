import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function Moviedetails() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (loading) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center">
        <div className="text-white text-2xl">Loading movie...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-2">Error: {error}</div>
          <div className="text-gray-400">Make sure your backend server is running</div>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center">
        <div className="text-gray-400 text-xl">Movie not found</div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen text-white p-8">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-8">
        {/* Poster */}
        <img
          src={movie.poster}
          alt={movie.title}
          className="w-72 h-auto rounded-xl shadow-lg object-cover"
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/300x450/1f2937/ffffff?text=No+Image";
          }}
        />

        {/* Details */}
        <div>
          <h1 className="text-4xl font-bold mb-2">{movie.title}</h1>

          <p className="text-gray-300 mb-4">
            ⭐ {movie.rating} / 10 • {movie.releaseYear}
          </p>

          {movie.genres && movie.genres.length > 0 && (
            <p className="mb-4 text-gray-400">
              <strong>Genres:</strong> {movie.genres.join(", ")}
            </p>
          )}

          {movie.runtime && (
            <p className="mb-4 text-gray-400">
              <strong>Runtime:</strong> {movie.runtime} minutes
            </p>
          )}

          {movie.status && (
            <p className="mb-4 text-gray-400">
              <strong>Status:</strong> {movie.status}
            </p>
          )}

          {movie.tagline && (
            <p className="italic text-gray-300 mb-4">"{movie.tagline}"</p>
          )}

          <p className="text-lg leading-relaxed text-gray-200">
            {movie.overview || "No description available."}
          </p>
        </div>
      </div>
    </div>
  );
}