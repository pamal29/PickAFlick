import axios from 'axios';

const API_KEY = 'YOUR_TMDB_API_KEY'; // Get from https://www.themoviedb.org/settings/api
const BASE_URL = 'https://api.themoviedb.org/3';

export const tmdbApi = {
  // Search movies and TV shows
  search: async (query) => {
    const response = await axios.get(`${BASE_URL}/search/multi`, {
      params: { api_key: API_KEY, query }
    });
    return response.data.results;
  },

  // Get trending content
  getTrending: async () => {
    const response = await axios.get(`${BASE_URL}/trending/all/week`, {
      params: { api_key: API_KEY }
    });
    return response.data.results;
  },

  // Get movie details
  getMovieDetails: async (id) => {
    const response = await axios.get(`${BASE_URL}/movie/${id}`, {
      params: { api_key: API_KEY }
    });
    return response.data;
  },

  // Get TV show details
  getTVDetails: async (id) => {
    const response = await axios.get(`${BASE_URL}/tv/${id}`, {
      params: { api_key: API_KEY }
    });
    return response.data;
  }
};