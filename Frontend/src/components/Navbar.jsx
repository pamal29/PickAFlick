import { useState, useEffect, useRef } from "react";
import { Bell, Search, X, Film, List, Home, Clapperboard, UserCircle2, LogOut, LogIn, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const navigate = useNavigate();
  const [showSearch, setShowSearch] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [searching, setSearching] = useState(false);
  const { user, profile, logout } = useAuth();
  const drawerRef = useRef(null);
  const searchRef = useRef(null);

  // Close drawer on outside click
  useEffect(() => {
    const handler = (e) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target)) {
        setShowDrawer(false);
      }
    };
    if (showDrawer) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showDrawer]);

  // Close search on outside click
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        closeSearch();
      }
    };
    if (showSearch) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showSearch]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    setSearching(true);
    try {
      const response = await fetch(
        `http://localhost:3001/api/search?q=${encodeURIComponent(searchTerm)}`
      );
      if (!response.ok) throw new Error("Search failed");
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

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleResultClick = (item) => {
    if (item.media_type === "person") return;
    const type = item.media_type === "tv" ? "tv" : "movie";
    navigate(type === "tv" ? `/tvshow/${item.id}` : `/movie/${item.id}`);
    closeSearch();
  };

  const closeSearch = () => {
    setSearchTerm("");
    setShowSearch(false);
    setShowResults(false);
    setSearchResults([]);
  };

  const handleLogout = async () => {
    setShowDrawer(false);
    await logout();
    navigate('/');
  };

  const navLinks = [
    { label: "Home",     icon: Home,        path: "/"          },
    { label: "Movies",   icon: Clapperboard, path: "/movies"   },
    { label: "My List",  icon: List,        path: "/watchlist" },
    { label: "Profile",  icon: UserCircle2, path: "/profile"   },
  ];

  return (
    <>
      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-40 bg-[#0a0a0a] border-b border-[#1f1f1f] h-16 flex items-center justify-between px-6 md:px-10">

        {/* Left — Hamburger + Logo */}
        <div className="flex items-center gap-5">
          {/* Hamburger — three lines that morph to X */}
          <button
            onClick={() => setShowDrawer(!showDrawer)}
            className="flex flex-col justify-center gap-[5px] w-6 h-6 group"
            aria-label="Menu"
          >
            <span className={`block h-[2px] bg-[#39FF14] rounded transition-all duration-300 origin-center
              ${showDrawer ? 'rotate-45 translate-y-[7px]' : ''}`} />
            <span className={`block h-[2px] bg-[#39FF14] rounded transition-all duration-300
              ${showDrawer ? 'opacity-0 scale-x-0' : ''}`} />
            <span className={`block h-[2px] bg-[#39FF14] rounded transition-all duration-300 origin-center
              ${showDrawer ? '-rotate-45 -translate-y-[7px]' : ''}`} />
          </button>

          {/* Logo */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 group"
          >
            <Film size={22} className="text-[#39FF14]" />
            <span className="text-white font-bold text-xl tracking-tight group-hover:text-[#39FF14] transition-colors duration-200">
              PickAFlick
            </span>
          </button>
        </div>

        {/* Right — Search + Bells + Auth */}
        <div className="flex items-center gap-4">

          {/* Search */}
          <div ref={searchRef} className="relative">
            {!showSearch ? (
              <button
                onClick={() => setShowSearch(true)}
                className="text-[#a0a0a0] hover:text-[#39FF14] transition-colors"
              >
                <Search size={20} />
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  autoFocus
                  type="text"
                  placeholder="Search movies & shows..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    if (!e.target.value.trim()) setShowResults(false);
                  }}
                  onKeyDown={handleKeyDown}
                  className="bg-[#111111] border border-[#1f1f1f] focus:border-[#39FF14] text-white text-sm
                    rounded-lg px-3 py-1.5 w-56 outline-none transition-colors placeholder-[#4a4a4a]"
                />
                {searching && <span className="text-[#4a4a4a] text-xs">...</span>}
                <button onClick={closeSearch} className="text-[#4a4a4a] hover:text-white transition-colors">
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Search results dropdown */}
            {showResults && searchResults.length > 0 && (
              <div className="absolute top-full right-0 mt-2 w-96 bg-[#111111] border border-[#1f1f1f]
                rounded-xl shadow-2xl max-h-96 overflow-y-auto z-50">
                {searchResults.map((item) => {
                  const title = item.title || item.name;
                  const year = (item.release_date || item.first_air_date || "").substring(0, 4);
                  const type = item.media_type || (item.first_air_date ? "TV" : "Movie");
                  const poster = item.poster_path
                    ? `https://image.tmdb.org/t/p/w92${item.poster_path}`
                    : null;

                  return (
                    <div
                      key={`${item.id}-${type}`}
                      onClick={() => handleResultClick(item)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-[#1a1a1a] cursor-pointer
                        border-b border-[#1f1f1f] last:border-0 transition-colors"
                    >
                      {poster ? (
                        <img src={poster} alt={title} className="w-9 h-14 object-cover rounded" />
                      ) : (
                        <div className="w-9 h-14 bg-[#1f1f1f] rounded flex items-center justify-center">
                          <Film size={14} className="text-[#4a4a4a]" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-semibold truncate">{title}</p>
                        <p className="text-[#a0a0a0] text-xs capitalize">
                          {type}{year && ` · ${year}`}
                        </p>
                        {item.vote_average > 0 && (
                          <p className="text-[#39FF14] text-xs mt-0.5">
                            ★ {item.vote_average.toFixed(1)}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {showResults && searchResults.length === 0 && !searching && (
              <div className="absolute top-full right-0 mt-2 w-80 bg-[#111111] border border-[#1f1f1f]
                rounded-xl shadow-2xl p-5 z-50 text-center text-[#a0a0a0] text-sm">
                No results for "{searchTerm}"
              </div>
            )}
          </div>

          <button className="text-[#a0a0a0] hover:text-[#39FF14] transition-colors">
            <Bell size={20} />
          </button>

          {/* Auth — avatar or login button */}
          {user ? (
            <button
              onClick={() => setShowDrawer(true)}
              className="flex items-center gap-2 bg-[#111111] border border-[#1f1f1f] hover:border-[#39FF14]
                rounded-full pl-1 pr-3 py-1 transition-colors group"
            >
              <div className="w-7 h-7 rounded-full bg-[#39FF14] flex items-center justify-center">
                <span className="text-black text-xs font-bold uppercase">
                  {profile?.username?.[0] ?? '?'}
                </span>
              </div>
              <span className="text-[#a0a0a0] text-sm group-hover:text-white transition-colors">
                {profile?.username}
              </span>
            </button>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-1.5 bg-[#39FF14] hover:bg-[#5aff3a] text-black
                text-sm font-bold px-4 py-1.5 rounded-full transition-colors"
            >
              <LogIn size={15} />
              Login
            </button>
          )}
        </div>
      </nav>

      {/* ── Backdrop ── */}
      <div
        onClick={() => setShowDrawer(false)}
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300
          ${showDrawer ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      />

      {/* ── Slide-out Drawer ── */}
      <aside
        ref={drawerRef}
        className={`fixed top-0 left-0 h-full w-72 z-50 bg-[#0f0f0f] border-r border-[#1f1f1f]
          flex flex-col transform transition-transform duration-300 ease-in-out
          ${showDrawer ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#1f1f1f]">
          <div className="flex items-center gap-2">
            <Film size={18} className="text-[#39FF14]" />
            <span className="text-white font-bold text-lg">PickAFlick</span>
          </div>
          <button
            onClick={() => setShowDrawer(false)}
            className="text-[#4a4a4a] hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* User block */}
        {user ? (
          <div className="px-6 py-5 border-b border-[#1f1f1f]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#39FF14] flex items-center justify-center shrink-0">
                <span className="text-black font-bold text-sm uppercase">
                  {profile?.username?.[0] ?? '?'}
                </span>
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{profile?.username}</p>
                <p className="text-[#4a4a4a] text-xs truncate">{user.email}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="px-6 py-5 border-b border-[#1f1f1f] space-y-2">
            <button
              onClick={() => { navigate('/login'); setShowDrawer(false); }}
              className="w-full flex items-center justify-center gap-2 bg-[#39FF14] hover:bg-[#5aff3a]
                text-black font-bold py-2.5 rounded-xl text-sm transition-colors"
            >
              <LogIn size={15} />
              Login
            </button>
            <button
              onClick={() => { navigate('/register'); setShowDrawer(false); }}
              className="w-full flex items-center justify-center gap-2 bg-transparent border border-[#1f1f1f]
                hover:border-[#39FF14] text-[#a0a0a0] hover:text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
            >
              <UserPlus size={15} />
              Create account
            </button>
          </div>
        )}

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navLinks.map(({ label, icon: Icon, path }) => {
            const active = window.location.pathname === path;
            return (
              <button
                key={label}
                onClick={() => { navigate(path); setShowDrawer(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                  transition-all duration-150 group
                  ${active
                    ? 'bg-[#39FF1415] text-[#39FF14]'
                    : 'text-[#a0a0a0] hover:bg-[#1a1a1a] hover:text-white'
                  }`}
              >
                <Icon
                  size={18}
                  className={active ? 'text-[#39FF14]' : 'text-[#4a4a4a] group-hover:text-[#39FF14] transition-colors'}
                />
                {label}
                {active && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#39FF14]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout at bottom */}
        {user && (
          <div className="px-3 py-4 border-t border-[#1f1f1f]">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                text-[#ff4444] hover:bg-[#ff44441a] transition-all duration-150"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        )}
      </aside>
    </>
  );
}