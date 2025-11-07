// components/Navbar.jsx
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="bg-gray-900 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">
          🎬 MovieList
        </Link>
        <div className="space-x-6">
          <Link to="/" className="hover:text-blue-400">Home</Link>
          <Link to="/search" className="hover:text-blue-400">Search</Link>
          <Link to="/watchlist" className="hover:text-blue-400">My Watchlist</Link>
          <Link to="/login" className="hover:text-blue-400">Login</Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;