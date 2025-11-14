import React, { useState, useEffect } from "react";

export default function HorizontalScroller() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchTrending() {
      try {
        console.log("🔍 Fetching trending shows...");
        const res = await fetch("http://localhost:3001/api/trending");
        
        if (!res.ok) {
          throw new Error(`Failed to fetch: ${res.status}`);
        }
        
        const data = await res.json();
        console.log("✅ Received", data.length, "shows");
        
        // Map the API data to our image format
        const formattedImages = data.map(show => ({
          id: show.id,
          url: show.poster,
          title: show.title,
          rating: show.rating,
          year: show.releaseYear
        }));
        
        setImages(formattedImages);
      } catch (err) {
        console.error("❌ Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchTrending();
  }, []);

  // Show loading state
  if (loading) {
    return (
      <div className="bg-black py-12">
        <h2 className="text-4xl font-bold text-white ml-8 mb-8">
         Trending TV Shows
        </h2>
        <p className="text-center text-gray-400 text-lg">Loading Trendings...</p>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="bg-black py-12">
        <h2 className="text-4xl font-bold text-white ml-8 mb-8">
         Trending TV Shows
        </h2>
        <p className="text-center text-red-500">⚠️ {error}</p>
        <p className="text-center text-gray-400 mt-2">Make sure your backend server is running on port 3001</p>
      </div>
    );
  }

  // Duplicate the array for seamless loop
  const duplicatedImages = [...images, ...images];

  return (
    <div className="bg-black py-12 overflow-hidden">
      <h2 className="text-4xl font-bold text-white ml-8 mb-8">
         Trending TV Shows
      </h2>

      {/* Scrolling Container */}
      <div className="relative">
        <div className="flex gap-6 animate-scroll">
          {duplicatedImages.map((image, index) => (
            <div
              key={`${image.id}-${index}`}
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
            </div>
          ))}
        </div>

        {/* Fade edges */}
        <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-gray-900 to-transparent pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-gray-900 to-transparent pointer-events-none"></div>
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-scroll {
          animation: scroll 40s linear infinite;
        }

        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}