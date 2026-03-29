const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all availability rules
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM availability ORDER BY day_of_week ASC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update availability for a specific day
// (Creates if doesn't exist, updates if it does)
router.post('/', async (req, res) => {
  try {
    const { day_of_week, start_time, end_time, timezone } = req.body;
    
    // Validate day
    if (day_of_week < 0 || day_of_week > 6) {
      return res.status(400).json({ error: 'Invalid day_of_week (0-6)' });
    }

    const { rows } = await db.query(
      `INSERT INTO availability (day_of_week, start_time, end_time, timezone) 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT (day_of_week) 
       DO UPDATE SET start_time = EXCLUDED.start_time, end_time = EXCLUDED.end_time, timezone = EXCLUDED.timezone, created_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [day_of_week, start_time, end_time, timezone]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete availability for a day (if host wants to take a day off completely)
router.delete('/:day_of_week', async (req, res) => {
  try {
    const { day_of_week } = req.params;
    await db.query('DELETE FROM availability WHERE day_of_week = $1', [day_of_week]);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
