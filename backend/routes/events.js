const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all event types
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM event_types ORDER BY id ASC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single event type by slug
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const { rows } = await db.query('SELECT * FROM event_types WHERE slug = $1', [slug]);
    if (rows.length === 0) return res.status(404).json({ error: 'Event not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new event type
router.post('/', async (req, res) => {
  try {
    const { name, duration, slug, meeting_mode, platform, location, custom_link } = req.body;
    const mode = meeting_mode || 'online';
    const { rows } = await db.query(
      'INSERT INTO event_types (name, duration, slug, meeting_mode, platform, location, custom_link) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [name, duration, slug, mode, mode === 'online' ? (platform || 'google_meet') : null, mode === 'offline' ? (location || null) : null, custom_link || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') { // unique violation
      return res.status(400).json({ error: 'Slug already exists' });
    }
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update event type
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, duration, slug, meeting_mode, platform, location, custom_link } = req.body;
    const mode = meeting_mode || 'online';
    const { rows } = await db.query(
      'UPDATE event_types SET name = $1, duration = $2, slug = $3, meeting_mode = $4, platform = $5, location = $6, custom_link = $7, updated_at = CURRENT_TIMESTAMP WHERE id = $8 RETURNING *',
      [name, duration, slug, mode, mode === 'online' ? (platform || 'google_meet') : null, mode === 'offline' ? (location || null) : null, custom_link || null, id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Event not found' });
    res.json(rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Slug already exists' });
    }
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete event type
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if there are active bookings
    const check = await db.query('SELECT id FROM bookings WHERE event_type_id = $1 LIMIT 1', [id]);
    if (check.rows.length > 0) {
      return res.status(400).json({ error: 'Cannot delete event with active bookings' });
    }

    await db.query('DELETE FROM event_types WHERE id = $1', [id]);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
