import React, { useState, useEffect } from 'react';
import { Play, Star, Plus } from 'lucide-react';
import { useNavigate} from 'react-router';


export default function Hero() {
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleClick= ()=>{
    navigate("/login");
  }

  const fetchCurrentMovie = async () => {
    try {
      console.log('🎬 Fetching movie from backend...');
      
      const response = await fetch('http://localhost:3001/api/hero/current');
      
      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Movie data received:', data.title);
      
      setMovie(data);
      setLoading(false);
      setError(null);
    } catch (error) {
      console.error('❌ Error fetching movie:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('🚀 Hero component mounted');
    
    // Fetch immediately on mount
    fetchCurrentMovie();
    
    // Poll for updates every 2 seconds
    const interval = setInterval(fetchCurrentMovie, 2000);
    
    // Cleanup on unmount
    return () => {
      console.log('🛑 Cleaning up interval');
      clearInterval(interval);
    };
  }, []);

  if (error) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <p className="text-red-500 text-xl mb-4">❌ Error: {error}</p>
          <p className="text-white mb-4">Make sure backend is running on http://localhost:3001</p>
          <button 
            onClick={() => {
              setError(null);
              setLoading(true);
              fetchCurrentMovie();
            }}
            className="bg-green-500 text-black px-6 py-2 rounded-full font-bold hover:bg-green-600"
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
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading movies...</p>
          <p className="text-gray-400 text-sm mt-2">Connecting to backend...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-[60vh] md:min-h-[80vh] max-w-6xl mx-auto flex items-center justify-center bg-black relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        {movie.backdrop ? (
          <img
            key={movie.id}
            src={movie.backdrop}
            alt={movie.title}
            className="object-cover opacity-60"
            onError={(e) => {
              console.error('❌ Image failed to load:', movie.backdrop);
              e.target.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full bg-gray-900 flex items-center justify-center">
            <p className="text-gray-600">No backdrop image available</p>
          </div>
        )}
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center space-y-6 px-4 max-w-4xl text-center">
        {/* Movie Title */}
        <h1 className="text-white font-bold text-5xl md:text-6xl">
          {movie.title}
        </h1>
        
        {/* Movie Info */}
        <div className="flex items-center gap-4 font-bold text-white flex-wrap justify-center">
          <div className="flex items-center">
            <Star className="text-yellow-400 mr-1" fill="currentColor" size={20} />
            <p className="text-yellow-400">{movie.rating}</p>
          </div>
          <p>{movie.releaseYear}</p>
          <span className="px-3 py-1 bg-green-500 text-black text-sm font-bold rounded">HD</span>
        </div>

        {/* Description */}
        <p className="text-white text-lg max-w-2xl line-clamp-3">
          {movie.description || 'No description available'}
        </p>
        
        {/* Buttons */}
        <div className="flex space-x-4">
          
          <button 
            onClick={handleClick}
            className="flex items-center space-x-2 bg-gray-800 text-white px-8 py-3 rounded-full font-bold hover:bg-gray-700 transition-colors">
            <Plus size={20} />
            <span>My List</span>
          </button>
        </div>
      </div>
    </section>
  );
}