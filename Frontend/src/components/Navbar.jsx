import React, { useState } from "react";
import { Bell, User, AlignJustify, Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const [showSearch, setShowSearch] = useState(false);
  const [showNavs, setShowNavs] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [searching, setSearching] = useState(false);

  // 🔍 Handle search
  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setSearching(true);
    try {
      const response = await fetch(
        `http://localhost:3001/api/search?q=${encodeURIComponent(searchTerm)}`
      );

      if (!response.ok) {
        throw new Error("Search failed");
      }

      const data = await response.json();
      setSearchResults(data.results || []);
      setShowResults(true);
    } catch (error) {
      console.error("Search failed:", error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  // 🔎 Press Enter to search
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Navigate to details page
  const handleResultClick = (item) => {
    // TMDB returns media_type: "movie" or "tv" or "person"
    // Skip persons in results
    if (item.media_type === "person") return;
    
    const type = item.media_type === "tv" ? "tv" : "movie";
    const route = type === "tv" ? `/tvshow/${item.id}` : `/movie/${item.id}`;
    navigate(route);
    
    // Reset search
    setSearchTerm("");
    setShowResults(false);
    setShowSearch(false);
    setSearchResults([]);
  };

  // Close search
  const closeSearch = () => {
    setSearchTerm("");
    setShowSearch(false);
    setShowResults(false);
    setSearchResults([]);
  };

  return (
    <div className="relative bg-black min-h-[7vh] text-neongreen flex items-center justify-between px-10 mb-2">
      
      {/* Left side */}
      <div className="flex items-center text-3xl font-bold">
        {!showNavs ? (
          <AlignJustify
            className="cursor-pointer hover:scale-110 mr-8 mt-[6px] transition"
            onClick={() => setShowNavs(true)}
          />
        ) : (
          <X
            className="cursor-pointer hover:scale-110 mr-8 mt-[6px] transition"
            onClick={() => setShowNavs(false)}
          />
        )}

        <span className="cursor-pointer" onClick={() => navigate("/")}>
          PickAFlick
        </span>
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-8 relative">
        
        {/* Search Icon */}
        {!showSearch && (
          <Search
            className="cursor-pointer hover:text-white transition hover:scale-110"
            onClick={() => setShowSearch(true)}
          />
        )}

        {/* Search Input */}
        {showSearch && (
          <div className="relative">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Search movies & TV shows..."
                className="bg-transparent outline-none border-b border-neongreen text-white w-64"
                autoFocus
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  if (!e.target.value.trim()) {
                    setShowResults(false);
                  }
                }}
                onKeyDown={handleKeyDown}
              />

              {searching && (
                <div className="text-sm text-gray-400">...</div>
              )}

              <X
                className="cursor-pointer hover:text-white transition"
                onClick={closeSearch}
              />
            </div>

            {/* Search Results Dropdown */}
            {showResults && searchResults.length > 0 && (
              <div className="absolute top-full right-0 mt-2 w-96 bg-gray-900 rounded-lg shadow-2xl max-h-96 overflow-y-auto z-50 border border-neongreen">
                {searchResults.map((item) => {
                  const title = item.title || item.name;
                  const year = (item.release_date || item.first_air_date || "").substring(0, 4);
                  const type = item.media_type || (item.first_air_date ? "TV" : "Movie");
                  const poster = item.poster_path
                    ? `https://image.tmdb.org/t/p/w92${item.poster_path}`
                    : "https://via.placeholder.com/92x138/1f2937/ffffff?text=No+Image";

                  return (
                    <div
                      key={`${item.id}-${type}`}
                      className="flex items-center p-3 hover:bg-gray-800 cursor-pointer border-b border-gray-800 transition"
                      onClick={() => handleResultClick(item)}
                    >
                      <img
                        src={poster}
                        alt={title}
                        className="w-12 h-18 object-cover rounded mr-3"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/92x138/1f2937/ffffff?text=No+Image";
                        }}
                      />
                      <div className="flex-1">
                        <div className="text-white font-semibold">{title}</div>
                        <div className="text-sm text-gray-400">
                          {type} {year && `• ${year}`}
                        </div>
                        {item.vote_average > 0 && (
                          <div className="text-xs text-neongreen">
                            ⭐ {item.vote_average.toFixed(1)}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {showResults && searchResults.length === 0 && !searching && (
              <div className="absolute top-full right-0 mt-2 w-96 bg-gray-900 rounded-lg shadow-2xl p-4 z-50 border border-gray-700">
                <div className="text-gray-400 text-center">No results found</div>
              </div>
            )}
          </div>
        )}

        <Bell className="cursor-pointer hover:scale-110 transition" />
        <User className="cursor-pointer hover:scale-110 transition" />
      </div>

      {/* Dropdown menu */}
      {showNavs && (
        <div className="absolute top-full left-0 w-64 bg-gray-900 text-white p-6 shadow-lg rounded-b-2xl z-50">
          <ul className="space-y-4">
            <li 
              className="cursor-pointer hover:text-neongreen transition"
              onClick={() => { navigate("/"); setShowNavs(false); }}
            >
              Home
            </li>
            <li 
              className="cursor-pointer hover:text-neongreen transition"
              onClick={() => { navigate("/games"); setShowNavs(false); }}
            >
              Games
            </li>
            <li 
              className="cursor-pointer hover:text-neongreen transition"
              onClick={() => { navigate("/movies"); setShowNavs(false); }}
            >
              Movies
            </li>
            <li 
              className="cursor-pointer hover:text-neongreen transition"
              onClick={() => { navigate("/profile"); setShowNavs(false); }}
            >
              Profile
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}