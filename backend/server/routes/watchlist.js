const express = require('express');
const router = express.Router();
const { supabase } = require('../lib/supabaseClient');

// Add to watchlist
router.post('/', async (req, res) => {
  const { userId, username, movieId, title, poster, type } = req.body;
  try {
    const { data, error } = await supabase
      .from('watchlist')
      .insert({ user_id: userId, username, movie_id: movieId, title, poster, type })
      .select();

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (err) {
    console.error('Watchlist insert failed:', err);
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Already in watchlist' });
    }
    res.status(500).json({ error: 'Failed to add to watchlist' });
  }
});

// Get user's watchlist
router.get('/:userId', async (req, res) => {
  const { data, error } = await supabase
    .from('watchlist')
    .select('*')
    .eq('user_id', req.params.userId)
    .order('added_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Remove from watchlist
router.delete('/:userId/:movieId', async (req, res) => {
  const { error } = await supabase
    .from('watchlist')
    .delete()
    .eq('user_id', req.params.userId)
    .eq('movie_id', Number(req.params.movieId));

  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Removed from watchlist' });
});

// Check if in watchlist
router.get('/:userId/check/:movieId', async (req, res) => {
  const { type } = req.query;
  const { data, error } = await supabase
    .from('watchlist')
    .select('id')
    .eq('user_id', req.params.userId)
    .eq('movie_id', Number(req.params.movieId))
    .eq('type', type)
    .maybeSingle();

  if (error) return res.status(500).json({ error: error.message });
  res.json({ inWatchlist: !!data });
});

module.exports = router;