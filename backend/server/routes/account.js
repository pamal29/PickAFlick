const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../lib/supabaseClient');

router.delete('/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    await supabaseAdmin.from('watchlist').delete().eq('user_id', userId);
    await supabaseAdmin.from('profiles').delete().eq('id', userId);

    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) throw error;

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Account deletion failed:', err);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

module.exports = router;