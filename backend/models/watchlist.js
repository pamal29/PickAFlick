const mongoose = require('mongoose');

const watchlistSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  movieId: { type: Number, required: true },
  title:   { type: String, required: true },
  poster:  { type: String },
  type:    { type: String, enum: ['movie', 'tv'], default: 'movie' },
  addedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Watchlist', watchlistSchema);