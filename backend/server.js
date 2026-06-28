const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const app = express();
const PORT = 3001;

const TMDB_API_KEY = 'e7876fbc19d54844090f8bb90f9d768e';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/original';

app.use(cors());
app.use(express.json());

let heroMovies = [];



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

async function fetchHeroMovies() {
  try {
    console.log('🔍 Fetching movies from TMDB...');
    const response = await axios.get(`${TMDB_BASE_URL}/movie/popular`, {
      params: { api_key: TMDB_API_KEY, language: 'en-US', page: 1 },
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

// ─────────────────────────────────────────
// Watchlist Routes (MongoDB)
// ─────────────────────────────────────────

// Add to watchlist
// Add to watchlist
app.post('/api/watchlist', async (req, res) => {
  const { userId, movieId, title, poster, type } = req.body;
  const { data, error } = await supabase
    .from('watchlist')
    .insert({ user_id: userId, movie_id: movieId, title, poster, type });

  if (error) {
    if (error.code === '23505') // unique violation
      return res.status(409).json({ error: 'Already in watchlist' });
    return res.status(500).json({ error: error.message });
  }
  res.status(201).json(data);
});

// Get user's watchlist
app.get('/api/watchlist/:userId', async (req, res) => {
  const { data, error } = await supabase
    .from('watchlist')
    .select('*')
    .eq('user_id', req.params.userId)
    .order('added_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Remove from watchlist
app.delete('/api/watchlist/:userId/:movieId', async (req, res) => {
  const { error } = await supabase
    .from('watchlist')
    .delete()
    .eq('user_id', req.params.userId)
    .eq('movie_id', Number(req.params.movieId));

  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Removed from watchlist' });
});

// Check if in watchlist
app.get('/api/watchlist/:userId/check/:movieId', async (req, res) => {
  const { data, error } = await supabase
    .from('watchlist')
    .select('id')
    .eq('user_id', req.params.userId)
    .eq('movie_id', Number(req.params.movieId))
    .single();

  if (error && error.code !== 'PGRST116') // PGRST116 = no rows found
    return res.status(500).json({ error: error.message });
  res.json({ inWatchlist: !!data });
});

// ─────────────────────────────────────────
// TMDB Routes
// ─────────────────────────────────────────

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
      params: { api_key: TMDB_API_KEY, language: 'en-US' },
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
      params: { api_key: TMDB_API_KEY, language: 'en-US' },
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
      params: { api_key: TMDB_API_KEY, language: 'en-US' },
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
      params: { api_key: TMDB_API_KEY, language: 'en-US' },
      timeout: 30000
    });
    if (!response.data) {
      return res.status(404).json({ error: 'Movie not found' });
    }
    const movie = response.data;
    res.json({
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
    });
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
      params: { api_key: TMDB_API_KEY, language: 'en-US' },
      timeout: 30000
    });
    if (!response.data) {
      return res.status(404).json({ error: 'TV show not found' });
    }
    const show = response.data;
    res.json({
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
    });
  } catch (error) {
    console.error('❌ Error fetching TV show:', error.message);
    res.status(500).json({ error: 'Failed to fetch TV show details' });
  }
});

// Search for movies or TV shows
app.get('/api/search', async (req, res) => {
  const query = req.query.q;
  if (!query || query.trim() === '') {
    return res.status(400).json({ error: 'Missing search query' });
  }
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/search/multi`, {
      params: { api_key: TMDB_API_KEY, query, language: 'en-US' }
    });
    res.json({ results: response.data.results });
  } catch (error) {
    console.error('❌ Search error:', error.message);
    res.status(500).json({ error: 'Failed to fetch search results' });
  }
});

// ─────────────────────────────────────────
// Start Server 
// ─────────────────────────────────────────

async function init() {
  console.log('\n🎬 TMDB Movie Server Starting...\n');
  const success = await fetchHeroMovies();
  if (!success) {
    console.error('⚠️  Failed to load movies on startup\n');
  }
  app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}\n`);
  });
}

init();