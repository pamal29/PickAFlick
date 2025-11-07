// components/MovieCard.jsx
function MovieCard({ movie, onAddToWatchlist }) {
  const posterUrl = movie.poster_path 
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : '/placeholder-poster.png';

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:scale-105 transition-transform">
      <img 
        src={posterUrl} 
        alt={movie.title}
        className="w-full h-80 object-cover"
      />
      <div className="p-4">
        <h3 className="text-white font-semibold text-lg mb-2">
          {movie.title || movie.name}
        </h3>
        <p className="text-gray-400 text-sm mb-3">
          {movie.release_date?.substring(0, 4) || movie.first_air_date?.substring(0, 4)}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-yellow-400">
            ⭐ {movie.vote_average?.toFixed(1)}
          </span>
          <button 
            onClick={() => onAddToWatchlist(movie)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            + Add
          </button>
        </div>
      </div>
    </div>
  );
}

export default MovieCard;