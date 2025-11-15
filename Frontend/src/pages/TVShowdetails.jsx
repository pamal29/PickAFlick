import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function TVShowdetails() {
  const { id } = useParams();
  const [show, setShow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (loading) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center">
        <div className="text-white text-2xl">Loading TV show...</div>
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

  if (!show) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center">
        <div className="text-gray-400 text-xl">TV show not found</div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen text-white p-8">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-8">
        {/* Poster */}
        <img
          src={show.poster}
          alt={show.title}
          className="w-72 h-auto rounded-xl shadow-lg object-cover"
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/300x450/1f2937/ffffff?text=No+Image";
          }}
        />

        {/* Details */}
        <div>
          <h1 className="text-4xl font-bold mb-2">{show.title}</h1>

          <p className="text-gray-300 mb-4">
            ⭐ {show.rating} / 10 • {show.releaseYear}
          </p>

          {show.genres && show.genres.length > 0 && (
            <p className="mb-4 text-gray-400">
              <strong>Genres:</strong> {show.genres.join(", ")}
            </p>
          )}

          {show.numberOfSeasons && (
            <p className="mb-4 text-gray-400">
              <strong>Seasons:</strong> {show.numberOfSeasons} • 
              <strong> Episodes:</strong> {show.numberOfEpisodes || 'N/A'}
            </p>
          )}

          {show.status && (
            <p className="mb-4 text-gray-400">
              <strong>Status:</strong> {show.status}
            </p>
          )}

          {show.tagline && (
            <p className="italic text-gray-300 mb-4">"{show.tagline}"</p>
          )}

          <p className="text-lg leading-relaxed text-gray-200">
            {show.overview || "No description available."}
          </p>
        </div>
      </div>
    </div>
  );
}