const axios = require('axios');

const TMDB_API_KEY = process.env.TMDB_API_KEY || 'e7876fbc19d54844090f8bb90f9d768e';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/original';

const tmdb = axios.create({
  baseURL: TMDB_BASE_URL,
  timeout: 30000,
  params: { api_key: TMDB_API_KEY, language: 'en-US' }
});

module.exports = { tmdb, TMDB_IMAGE_BASE };