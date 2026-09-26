const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

require('dotenv').config();

const express = require('express');
const cors = require('cors');

console.log('URL:', process.env.SUPABASE_URL);
console.log('KEY exists:', !!process.env.SUPABASE_KEY);
console.log('SERVICE KEY exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);

const { router: tmdbRouter, fetchHeroMovies } = require('./routes/tmdb');
const watchlistRouter = require('./routes/watchlist');
const accountRouter = require('./routes/account');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.use('/api/watchlist', watchlistRouter);
app.use('/api/account', accountRouter);
app.use('/api', tmdbRouter); // hero/all, genres, browse, movie/*, tv/*, trending*, search

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