const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { HttpsProxyAgent } = require('https-proxy-agent');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = 3001;

const TMDB_API_KEY = 'e7876fbc19d54844090f8bb90f9d768e';
// const PROXY_HOST = '192.168.16.2';  
// const PROXY_PORT = 3128;

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/original';

app.use(cors());
app.use(express.json());

let heroMovies = [];

// const proxyUrl = `http://${PROXY_HOST}:${PROXY_PORT}`;
// const proxyAgent = new HttpsProxyAgent(proxyUrl);

// console.log(`🌐 Using Proxy: ${proxyUrl}`);

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
    
    const response = await axios.get(`${TMDB_BASE_URL}/movie/popular`, {
      params: {
        api_key: TMDB_API_KEY,
        language: 'en-US',
        page: 1
      },
      // httpsAgent: proxyAgent,
      timeout: 30000
    });
    
    if (response.data && response.data.results) {
      heroMovies = response.data.results.slice(0, 10).map(formatMovie);
      console.log(`✅ Successfully fetched ${heroMovies.length} movies`);
      return true;
    }
    return false;
  } catch (error) {
    console.error('❌ Error fetching movies:', error.message);
    return false;
  }
}

// Get all hero movies
app.get('/api/hero/all', (req, res) => {
  if (heroMovies.length === 0) {
    return res.status(503).json({ error: 'No movies available' });
  }
  res.json(heroMovies);
});

// Fetch movie credits (cast & crew)
app.get('/api/movie/:id/credits', async (req, res) => {
  const movieId = req.params.id;

  try {
    const response = await axios.get(`${TMDB_BASE_URL}/movie/${movieId}/credits`, {
      params: {
        api_key: TMDB_API_KEY,
        language: 'en-US'
      },
      // httpsAgent: proxyAgent,
      timeout: 30000
    });

    if (!response.data) {
      return res.status(404).json({ error: 'Credits not found' });
    }

    res.json({
      cast: response.data.cast.slice(0, 10),
      crew: response.data.crew.filter(person => 
        person.job === 'Director' || person.job === 'Producer'
      ).slice(0, 5)
    });

  } catch (error) {
    console.error('❌ Error fetching credits:', error.message);
    res.status(500).json({ error: 'Failed to fetch credits' });
  }
});

// Fetch trending TV shows
app.get('/api/trending', async (req, res) => {
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/trending/tv/week`, {
      params: {
        api_key: TMDB_API_KEY,
        language: 'en-US'      
      },
      // httpsAgent: proxyAgent,
      timeout: 30000
    });

    if (response.data && response.data.results) {
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
      res.status(500).json({ error: 'No results found' });
    }
  } catch (error) {
    console.error('❌ Error fetching trending TV shows:', error.message);
    res.status(500).json({ error: 'Failed to fetch trending TV shows' });
  }
});

// Fetch trending movies
app.get('/api/trending-movies', async (req, res) => {
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/trending/movie/week`, {
      params: {
        api_key: TMDB_API_KEY,
        language: 'en-US'
      },
      // httpsAgent: proxyAgent,
      timeout: 30000
    });

    if (response.data && response.data.results) {
      const trendingMovies = response.data.results.slice(0, 20).map(movie => ({
        id: movie.id,
        title: movie.title || movie.original_title,
        description: movie.overview,
        rating: movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A',
        releaseYear: movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A',
        backdrop: movie.backdrop_path ? `${TMDB_IMAGE_BASE}${movie.backdrop_path}` : null,
        poster: movie.poster_path ? `${TMDB_IMAGE_BASE}${movie.poster_path}` : null
      }));

      res.json(trendingMovies);
    } else {
      res.status(500).json({ error: 'No results found' });
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
    const response = await axios.get(`${TMDB_BASE_URL}/movie/${movieId}`, {
      params: {
        api_key: TMDB_API_KEY,
        language: 'en-US'
      },
      // httpsAgent: proxyAgent,
      timeout: 30000
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
      releaseYear: movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A',
      genres: movie.genres ? movie.genres.map(g => g.name) : [],
      poster: movie.poster_path ? TMDB_IMAGE_BASE + movie.poster_path : null,
      backdrop: movie.backdrop_path ? TMDB_IMAGE_BASE + movie.backdrop_path : null,
      runtime: movie.runtime,
      status: movie.status,
      tagline: movie.tagline
    };

    res.json(formatted);
  } catch (error) {
    console.error('❌ Error fetching movie:', error.message);
    res.status(500).json({ error: 'Failed to fetch movie details' });
  }
});

// Fetch single TV show details
app.get('/api/tv/:id', async (req, res) => {
  const tvId = req.params.id;

  try {
    const response = await axios.get(`${TMDB_BASE_URL}/tv/${tvId}`, {
      params: {
        api_key: TMDB_API_KEY,
        language: 'en-US'
      },
      // httpsAgent: proxyAgent,
      timeout: 30000
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
      releaseYear: show.first_air_date ? new Date(show.first_air_date).getFullYear() : 'N/A',
      genres: show.genres ? show.genres.map(g => g.name) : [],
      poster: show.poster_path ? TMDB_IMAGE_BASE + show.poster_path : null,
      backdrop: show.backdrop_path ? TMDB_IMAGE_BASE + show.backdrop_path : null,
      numberOfSeasons: show.number_of_seasons,
      numberOfEpisodes: show.number_of_episodes,
      status: show.status,
      tagline: show.tagline
    };

    res.json(formatted);
  } catch (error) {
    console.error('❌ Error fetching TV show:', error.message);
    res.status(500).json({ error: 'Failed to fetch TV show details' });
  }
});

// Search for movies or TV shows
app.get('/api/search', async (req, res) => {
  const query = req.query.q;

  if (!query || query.trim() === '') {
    return res.status(400).json({ error: "Missing search query" });
  }

  try {
    const response = await axios.get(`${TMDB_BASE_URL}/search/multi`, {
      params: {
        api_key: TMDB_API_KEY,
        query: query,
        language: "en-US"
      },
      // httpsAgent: proxyAgent
    });

    res.json({ results: response.data.results });
  } catch (error) {
    console.error('❌ Search error:', error.message);
    res.status(500).json({ error: "Failed to fetch search results" });
  }
});

// Initialize server
async function init() {
  console.log('\n🎬 TMDB Movie Server Starting...\n');
  // console.log(`🌐 Proxy: ${PROXY_HOST}:${PROXY_PORT}\n`);
  
  const success = await fetchHeroMovies();
  
  if (!success) {
    console.error('⚠️  Failed to load movies on startup\n');
  }
  
  app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}\n`);
  });
}

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.log('❌ MongoDB connection failed:', err.message));

init();