import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Hero from './pages/Hero.jsx'
import Navbar from './components/Navbar.jsx'
import Trending from './components/Trending.jsx'
import Moviedetails from './pages/Moviedetails.jsx';
import TVShowdetails from './pages/TVShowdetails.jsx';
import Login from './pages/Login.jsx';
import WatchlistPage from './pages/WatchlistPage';
import Register from './pages/Register';


function App() {
  return (
    <BrowserRouter>
      <div className='bg-black min-h-screen'>
        <Routes>
          <Route 
            path="/" 
            element={
              <>
                <Navbar />
                <Hero />
                <Trending />
              </>  
              } />        
          <Route path="/movie/:id" element={<Moviedetails />} />   
          <Route path="/tv/:id" element={<TVShowdetails />} />
          <Route path='/login' element={<Login/>}/>
          <Route path="/register" element={<Register />} />
          <Route path="/watchlist" element={<WatchlistPage />} />

        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App 