const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { HttpsProxyAgent } = require('https-proxy-agent');

const app = express();
const PORT = 3001;

// ⚠️ REPLACE THIS WITH YOUR TMDB API KEY
const TMDB_API_KEY = 'e7876fbc19d54844090f8bb90f9d768e';

// 🌐 PROXY CONFIGURATION
// Replace with your proxy IP and port
const PROXY_HOST = '192.168.16.2';  // ← PUT YOUR PROXY IP HERE
const PROXY_PORT = 3128;            // ← PUT YOUR PROXY PORT HERE

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/original';

app.use(cors());
app.use(express.json());

let heroMovies = [];
let currentHeroIndex = 0;

// Create proxy agent
const proxyUrl = `http://${PROXY_HOST}:${PROXY_PORT}`;
const proxyAgent = new HttpsProxyAgent(proxyUrl);

console.log(`🌐 Using Proxy: ${proxyUrl}`);

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
      httpsAgent: proxyAgent,
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
      console.error('\n   🔧 Proxy might not be working. Check:');
      console.error(`   - Proxy IP: ${PROXY_HOST}`);
      console.error(`   - Proxy Port: ${PROXY_PORT}`);
      console.error('   - Make sure the proxy address and port are correct\n');
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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'running',
    moviesLoaded: heroMovies.length,
    apiKeySet: TMDB_API_KEY !== 'YOUR_TMDB_API_KEY_HERE',
    apiKeyLength: TMDB_API_KEY.length,
    currentMovie: heroMovies.length > 0 ? heroMovies[currentHeroIndex].title : 'None',
    proxy: `${PROXY_HOST}:${PROXY_PORT}`
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
  
  console.log(`🌐 Proxy: ${PROXY_HOST}:${PROXY_PORT}\n`);
  
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
    console.log(`   http://localhost:${PORT}/api/health`);
    console.log(`   http://localhost:${PORT}/api/refresh`);
    console.log('\n');
  });
}

init();