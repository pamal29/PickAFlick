const express = require('express');
const router = express.Router();
const { tmdb, TMDB_IMAGE_BASE } = require('../lib/tmdbClient');

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

let heroMovies = [];

async function fetchHeroMovies() {
  try {
    console.log('🔍 Fetching movies from TMDB...');
    const response = await tmdb.get('/movie/popular', { params: { page: 1 } });
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

router.get('/hero/all', (req, res) => {
  if (heroMovies.length === 0) {
    return res.status(503).json({ error: 'No movies available' });
  }
  res.json(heroMovies);
});

router.get('/genres/:type', async (req, res) => {
  try {
    const response = await tmdb.get(`/genre/${req.params.type}/list`);
    res.json(response.data.genres);
  } catch (error) {
    console.error('❌ Error fetching genres:', error.message);
    res.status(500).json({ error: 'Failed to fetch genres' });
  }
});

router.get('/browse', async (req, res) => {
  const { type = 'movie', genre, minRating, sortBy = 'popularity.desc', page = 1 } = req.query;
  try {
    const params = { sort_by: sortBy, page, include_adult: false };
    if (genre) params.with_genres = genre;
    if (minRating) {
      params['vote_average.gte'] = minRating;
      params['vote_count.gte'] = 50;
    }

    const response = await tmdb.get(`/discover/${type}`, { params });

    const results = response.data.results.map(item => ({
      id: item.id,
      title: item.title || item.name,
      description: item.overview,
      rating: item.vote_average ? item.vote_average.toFixed(1) : 'N/A',
      releaseYear: (item.release_date || item.first_air_date)
        ? new Date(item.release_date || item.first_air_date).getFullYear()
        : 'N/A',
      backdrop: item.backdrop_path ? TMDB_IMAGE_BASE + item.backdrop_path : null,
      poster: item.poster_path ? TMDB_IMAGE_BASE + item.poster_path : null,
      genreIds: item.genre_ids,
      type
    }));

    res.json({ results, page: response.data.page, totalPages: response.data.total_pages });
  } catch (error) {
    console.error('❌ Error fetching browse results:', error.message);
    res.status(500).json({ error: 'Failed to fetch browse results' });
  }
});

router.get('/movie/:id/credits', async (req, res) => {
  try {
    const response = await tmdb.get(`/movie/${req.params.id}/credits`);
    if (!response.data) return res.status(404).json({ error: 'Credits not found' });
    res.json({
      cast: response.data.cast.slice(0, 10),
      crew: response.data.crew.filter(p => p.job === 'Director' || p.job === 'Producer').slice(0, 5)
    });
  } catch (error) {
    console.error('❌ Error fetching credits:', error.message);
    res.status(500).json({ error: 'Failed to fetch credits' });
  }
});

router.get('/movie/:id/videos', async (req, res) => {
  try {
    const response = await tmdb.get(`/movie/${req.params.id}/videos`);
    const results = response.data.results || [];
    const trailer =
      results.find(v => v.type === 'Trailer' && v.site === 'YouTube' && v.official) ||
      results.find(v => v.type === 'Trailer' && v.site === 'YouTube') ||
      results.find(v => v.site === 'YouTube');
    res.json({ key: trailer?.key || null });
  } catch (err) {
    console.error('❌ Error fetching videos:', err.message);
    res.status(500).json({ key: null, error: 'Failed to fetch videos' });
  }
});

router.get('/tv/:id/videos', async (req, res) => {
  try {
    const response = await tmdb.get(`/tv/${req.params.id}/videos`);
    const results = response.data.results || [];
    const trailer =
      results.find(v => v.type === 'Trailer' && v.site === 'YouTube' && v.official) ||
      results.find(v => v.type === 'Trailer' && v.site === 'YouTube') ||
      results.find(v => v.site === 'YouTube');
    res.json({ key: trailer?.key || null });
  } catch (err) {
    console.error('❌ Error fetching videos:', err.message);
    res.status(500).json({ key: null, error: 'Failed to fetch videos' });
  }
});

router.get('/trending', async (req, res) => {
  try {
    const response = await tmdb.get('/trending/tv/week');
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

router.get('/trending-movies', async (req, res) => {
  try {
    const response = await tmdb.get('/trending/movie/week');
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

router.get('/movie/:id', async (req, res) => {
  try {
    const response = await tmdb.get(`/movie/${req.params.id}`);
    if (!response.data) return res.status(404).json({ error: 'Movie not found' });
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

router.get('/tv/:id', async (req, res) => {
  try {
    const response = await tmdb.get(`/tv/${req.params.id}`);
    if (!response.data) return res.status(404).json({ error: 'TV show not found' });
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

router.get('/search', async (req, res) => {
  const query = req.query.q;
  if (!query || query.trim() === '') {
    return res.status(400).json({ error: 'Missing search query' });
  }
  try {
    const response = await tmdb.get('/search/multi', { params: { query } });
    res.json({ results: response.data.results });
  } catch (error) {
    console.error('❌ Search error:', error.message);
    res.status(500).json({ error: 'Failed to fetch search results' });
  }
});

module.exports = { router, fetchHeroMovies };