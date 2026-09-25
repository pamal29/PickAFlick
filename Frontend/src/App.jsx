import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import supabase from './supabaseClient.js';

import Hero from './pages/Hero.jsx';
import Navbar from './components/Navbar.jsx';
import Trending from './components/Trending.jsx';
import Moviedetails from './pages/Moviedetails.jsx';
import TVShowdetails from './pages/TVShowdetails.jsx';
import Login from './pages/Login.jsx';
import WatchlistPage from './pages/WatchlistPage';
import Register from './pages/Register';
import ProfileSettings from './pages/ProfileSettings.jsx';

function AppRoutes() {
  const location = useLocation();
  const hideNavbar = ['/login', '/register'].includes(location.pathname);

  return (
    <div className="bg-black min-h-screen">
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Hero />
              <Trending />
            </>
          }
        />
        <Route path="/movie/:id" element={<Moviedetails />} />
        <Route path="/tv/:id" element={<TVShowdetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/watchlist" element={<WatchlistPage />} />
        <Route path="/profile" element={<ProfileSettings />} />
      </Routes>
    </div>
  );
}

function App() {
  useEffect(() => {
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.error('Supabase connection error:', error.message);
      } else {
        console.log('Supabase connected ✅', data);
      }
    });
  }, []);

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;