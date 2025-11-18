


const express = require('express');
const cors = require('cors');
const axios = require('axios');
// const { HttpsProxyAgent } = require('https-proxy-agent');

const app = express();
const PORT = 3001;

// ⚠️ REPLACE THIS WITH YOUR TMDB API KEY
const TMDB_API_KEY = 'e7876fbc19d54844090f8bb90f9d768e';

// const PROXY_HOST = '192.168.16.2';  
// const PROXY_PORT = 3128;            

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/original';

app.use(cors());
app.use(express.json());

let heroMovies = [];
let currentHeroIndex = 0;

// // // const proxyUrl = `http://${PROXY_HOST}:${PROXY_PORT}`;
// // // const proxyAgent = new HttpsProxyAgent(proxyUrl);

// // console.log(`🌐 Using Proxy: ${proxyUrl}`);

// Format movie data
function formatMovie(movie) {
  return {
    id: movie.id,
    title: movie.title,
    description: movie.overview,
    rating: movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A',
    releaseYear: movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A',
    backdrop: movie.backdrop_path ? TMDB_IMAGE_BASE + movie.backdrop_path : null,
    poster: movie.poster_path ? TMDB_IMAGE_BASE + movie.poster_path : null
  };
}

// Fetch popular movies for hero section
async function fetchHeroMovies() {
  try {
    console.log('🔍 Fetching movies from TMDB...');
    console.log(`📡 API URL: ${TMDB_BASE_URL}/movie/popular`);
    console.log(`🔑 API Key (first 8 chars): ${TMDB_API_KEY.substring(0, 8)}...`);
    
    const response = await axios.get(`${TMDB_BASE_URL}/movie/popular`, {
      params: {
        api_key: TMDB_API_KEY,
        language: 'en-US',
        page: 1
      },
      // httpsAgent: proxyAgent,
      timeout: 30000,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data && response.data.results) {
      heroMovies = response.data.results.slice(0, 10).map(formatMovie);
      console.log(`✅ Successfully fetched ${heroMovies.length} movies`);
      console.log(`📽️  First movie: ${heroMovies[0].title}`);
      return true;
    } else {
      console.error('❌ No results in API response');
      return false;
    }
  } catch (error) {
    console.error('❌ Error fetching movies:');
    
    if (error.response) {
      console.error(`   Status Code: ${error.response.status}`);
      console.error(`   Status Text: ${error.response.statusText}`);
      
      if (error.response.data) {
        console.error(`   Error Message: ${JSON.stringify(error.response.data)}`);
      }
      
      if (error.response.status === 401) {
        console.error('\n⚠️  AUTHENTICATION FAILED - INVALID API KEY!');
        console.error('   Get a new key from: https://www.themoviedb.org/settings/api\n');
      }
    } else if (error.request) {
      console.error('   ❌ NO RESPONSE FROM TMDB SERVER');
      console.error('   Error code:', error.code);
      // console.error('\n   🔧 Proxy might not be working. Check:');
      // // console.error(`   - Proxy IP: ${PROXY_HOST}`);
      // // console.error(`   - Proxy Port: ${PROXY_PORT}`);
      // console.error('   - Make sure the proxy address and port are correct\n');
    } else {
      console.error(`   Unexpected error: ${error.message}`);
    }
    return false;
  }
}

// API endpoint - get current hero movie
app.get('/api/hero/current', (req, res) => {
  if (heroMovies.length === 0) {
    return res.status(503).json({ 
      error: 'No movies available. Check server logs for details.' 
    });
  }
  res.json(heroMovies[currentHeroIndex]);
});

// Fetch trending tv-series
app.get('/api/trending', async (req, res) => {
  try {
    console.log('📺 Fetching trending TV shows...');
    
    const response = await axios.get(`${TMDB_BASE_URL}/trending/tv/week`, {
      params: {
        api_key: TMDB_API_KEY,
        language: 'en-US'      
      },
      // httpsAgent: proxyAgent,
      timeout: 30000,
      headers:{
        'accept':'application/json',
        'Content-Type':'application/json'
      }
    });

    if (response.data && response.data.results) {
      // Map and format TV show data
      const trendingShows = response.data.results.slice(0, 20).map(show => ({
        id: show.id,
        title: show.name || show.original_name,
        description: show.overview,
        rating: show.vote_average ? show.vote_average.toFixed(1) : 'N/A',
        releaseYear: show.first_air_date ? new Date(show.first_air_date).getFullYear() : 'N/A',
        backdrop: show.backdrop_path ? `${TMDB_IMAGE_BASE}${show.backdrop_path}` : null,
        poster: show.poster_path ? `${TMDB_IMAGE_BASE}${show.poster_path}` : null
      }));

      res.json(trendingShows);
    } else {
      res.status(500).json({ error: 'No results found in TMDB' });
    }

  } catch (error) {
    console.error('❌ Error fetching trending TV shows:', error.message);
    res.status(500).json({ error: 'Failed to fetch trending TV shows' });
  }
});

// Fetch trending Movies
app.get('/api/trending-movies', async (req, res) => {
  try {
    console.log('🎬 Fetching trending movies...');

    const response = await axios.get(`${TMDB_BASE_URL}/trending/movie/week`, {
      params: {
        api_key: TMDB_API_KEY,
        language: 'en-US'
      },
      // httpsAgent: proxyAgent,
      timeout: 30000,
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (response.data && response.data.results) {
      // Format movie data
      const trendingMovies = response.data.results.slice(0, 20).map(movie => ({
        id: movie.id,
        title: movie.title || movie.original_title,
        description: movie.overview,
        rating: movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A',
        releaseYear: movie.release_date
          ? new Date(movie.release_date).getFullYear()
          : 'N/A',
        backdrop: movie.backdrop_path
          ? `${TMDB_IMAGE_BASE}${movie.backdrop_path}`
          : null,
        poster: movie.poster_path
          ? `${TMDB_IMAGE_BASE}${movie.poster_path}`
          : null
      }));

      res.json(trendingMovies);
    } else {
      res.status(500).json({ error: 'No results found in TMDB' });
    }

  } catch (error) {
    console.error('❌ Error fetching trending movies:', error.message);
    res.status(500).json({ error: 'Failed to fetch trending movies' });
  }
});

// Fetch single movie details
app.get('/api/movie/:id', async (req, res) => {
  const movieId = req.params.id;

  try {
    console.log(`🎞 Fetching details for movie ID: ${movieId}`);

    const response = await axios.get(`${TMDB_BASE_URL}/movie/${movieId}`, {
      params: {
        api_key: TMDB_API_KEY,
        language: 'en-US'
      },
      // httpsAgent: proxyAgent,
      timeout: 30000,
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (!response.data) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    const movie = response.data;

    const formatted = {
      id: movie.id,
      title: movie.title,
      overview: movie.overview,
      rating: movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A',
      releaseYear: movie.release_date
        ? new Date(movie.release_date).getFullYear()
        : 'N/A',
      genres: movie.genres ? movie.genres.map(g => g.name) : [],
      poster: movie.poster_path ? TMDB_IMAGE_BASE + movie.poster_path : null,
      backdrop: movie.backdrop_path ? TMDB_IMAGE_BASE + movie.backdrop_path : null,
      runtime: movie.runtime,
      status: movie.status,
      tagline: movie.tagline
    };

    res.json(formatted);
    console.log(`✅ Movie fetched: ${formatted.title}`);

  } catch (error) {
    console.error('❌ Error fetching movie:', error.message);
    res.status(500).json({ error: 'Failed to fetch movie details' });
  }
});

// Fetch single TV show details ⭐ NEW ENDPOINT ⭐
app.get('/api/tv/:id', async (req, res) => {
  const tvId = req.params.id;

  try {
    console.log(`📺 Fetching details for TV show ID: ${tvId}`);

    const response = await axios.get(`${TMDB_BASE_URL}/tv/${tvId}`, {
      params: {
        api_key: TMDB_API_KEY,
        language: 'en-US'
      },
      // httpsAgent: proxyAgent,
      timeout: 30000,
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (!response.data) {
      return res.status(404).json({ error: 'TV show not found' });
    }

    const show = response.data;

    const formatted = {
      id: show.id,
      title: show.name,
      overview: show.overview,
      rating: show.vote_average ? show.vote_average.toFixed(1) : 'N/A',
      releaseYear: show.first_air_date
        ? new Date(show.first_air_date).getFullYear()
        : 'N/A',
      genres: show.genres ? show.genres.map(g => g.name) : [],
      poster: show.poster_path ? TMDB_IMAGE_BASE + show.poster_path : null,
      backdrop: show.backdrop_path ? TMDB_IMAGE_BASE + show.backdrop_path : null,
      numberOfSeasons: show.number_of_seasons,
      numberOfEpisodes: show.number_of_episodes,
      status: show.status,
      tagline: show.tagline
    };

    res.json(formatted);
    console.log(`✅ TV show fetched: ${formatted.title}`);

  } catch (error) {
    console.error('❌ Error fetching TV show:', error.message);
    res.status(500).json({ error: 'Failed to fetch TV show details' });
  }
});


//search for a movie or series
app.get('/api/search', async (req, res)=>{
  const query = req.query.q;

  if(!query || query.trim() === ''){
    return res.status(400).json({error: "Missing search query"}) // Fixed: was "syayus"
  }

  try{
    const response = await axios.get('https://api.themoviedb.org/3/search/multi',{
      params: {
        api_key: TMDB_API_KEY,
        query: query,
        language: "en-us"
      }
    });

    res.json({results: response.data.results}); // Wrapped in results object
  } catch (e) {
    console.error('❌ Search error:', e.message);
    res.status(500).json({error: "Failed to fetch search results"}); // Fixed typo
  }
});


// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'running',
    moviesLoaded: heroMovies.length,
    apiKeySet: TMDB_API_KEY !== 'YOUR_TMDB_API_KEY_HERE',
    apiKeyLength: TMDB_API_KEY.length,
    currentMovie: heroMovies.length > 0 ? heroMovies[currentHeroIndex].title : 'None',
    // // // proxy: `${PROXY_HOST}:${PROXY_PORT}`
  });
});

// Manual refresh endpoint for testing
app.get('/api/refresh', async (req, res) => {
  console.log('🔄 Manual refresh requested...');
  const success = await fetchHeroMovies();
  res.json({ 
    success, 
    moviesLoaded: heroMovies.length,
    message: success ? 'Movies loaded successfully' : 'Failed to load movies'
  });
});

// Rotate to next movie every 10 seconds
function rotateHeroMovie() {
  if (heroMovies.length === 0) {
    console.log('⏭️  Skipping rotation - no movies loaded');
    return;
  }
  
  currentHeroIndex = (currentHeroIndex + 1) % heroMovies.length;
  console.log(`🔄 Rotated to: ${heroMovies[currentHeroIndex].title}`);
}

// Initialize server
async function init() {
  console.log('\n═══════════════════════════════════════');
  console.log('🎬 TMDB Movie Server Starting...');
  console.log('═══════════════════════════════════════\n');
  
  // // // console.log(`🌐 Proxy: ${PROXY_HOST}:${PROXY_PORT}\n`);
  
  // Check if API key is set
  if (TMDB_API_KEY === 'YOUR_TMDB_API_KEY_HERE') {
    console.error('⚠️  WARNING: TMDB API KEY NOT SET!');
    console.error('   Please replace YOUR_TMDB_API_KEY_HERE in server.js\n');
  } else {
    console.log(`✓ API Key is set (${TMDB_API_KEY.length} characters)`);
  }
  
  const success = await fetchHeroMovies();
  
  if (success && heroMovies.length > 0) {
    setInterval(rotateHeroMovie, 10000);
    console.log('⏰ Movie rotation started (every 10 seconds)');
  } else {
    console.error('\n⚠️  Movie rotation NOT started - no movies loaded');
    console.error('   Try visiting: http://localhost:3001/api/refresh to retry\n');
  }
  
  app.listen(PORT, () => {
    console.log('\n═══════════════════════════════════════');
    console.log(`🎬 Server running on http://localhost:${PORT}`);
    console.log('═══════════════════════════════════════');
    console.log(`\n📍 Available endpoints:`);
    console.log(`   http://localhost:${PORT}/api/hero/current`);
    console.log(`   http://localhost:${PORT}/api/trending`);
    console.log(`   http://localhost:${PORT}/api/trending-movies`);
    console.log(`   http://localhost:${PORT}/api/movie/:id`);
    console.log(`   http://localhost:${PORT}/api/tv/:id ⭐ NEW`);
    console.log(`   http://localhost:${PORT}/api/health`);
    console.log(`   http://localhost:${PORT}/api/refresh`);
    console.log('\n');
  });
}

init();




const mongoose = require('mongoose');
require('dotenv').config();

// Add this line to debug:
console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Found' : 'NOT FOUND');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected successfully!'))
  .catch((err) => console.log('❌ Connection failed:', err.message));