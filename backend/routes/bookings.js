const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const db = require('../db');
const { sendBookingConfirmation, sendRescheduleConfirmation, sendCancellationNotice } = require('../utils/email');

// Helper: generate random meeting link
function generateMeetingLink(platform, custom_link) {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  const randChar = (n) => Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  const randNum = () => Math.floor(Math.random() * 9_000_000_000) + 1_000_000_000;

  switch (platform) {
    case 'google_meet':
      return `https://meet.google.com/${randChar(3)}-${randChar(4)}-${randChar(3)}`;
    case 'zoom':
      return `https://zoom.us/j/${randNum()}`;
    case 'teams':
      return `https://teams.microsoft.com/l/meetup-join/19%3ameeting_${randChar(10)}%40thread.v2/0`;
    case 'custom':
      return custom_link || null;
    default:
      return `https://meet.google.com/${randChar(3)}-${randChar(4)}-${randChar(3)}`;
  }
}

// Helper: check for overlapping bookings
async function hasOverlap(event_type_id, start_time, end_time, excludeIds = []) {
  let query = `
    SELECT id FROM bookings 
    WHERE event_type_id = $1 
    AND status = 'scheduled'
    AND (start_time < $3 AND end_time > $2)
  `;
  const params = [event_type_id, start_time, end_time];

  if (excludeIds.length > 0) {
    const placeholders = excludeIds.map((_, i) => `$${i + 4}`).join(', ');
    query += ` AND id NOT IN (${placeholders})`;
    params.push(...excludeIds);
  }

  const { rows } = await db.query(query, params);
  return rows.length > 0;
}

// Helper: full booking query with event join
const BOOKING_SELECT = `
  SELECT b.id, b.event_type_id, b.name AS invoke_name, b.email, 
         b.start_time, b.end_time, b.status,
         b.meeting_mode, b.meeting_link, b.platform, b.location,
         b.reschedule_token,
         e.name AS event_name, e.duration, e.slug
  FROM bookings b
  JOIN event_types e ON b.event_type_id = e.id
`;

// ──────────────────────────────────────────────
// GET /  — List all scheduled bookings
// ──────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query(`
      ${BOOKING_SELECT}
      WHERE b.status = 'scheduled'
      ORDER BY b.start_time DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ──────────────────────────────────────────────
// GET /token/:token  — Lookup booking by reschedule token
// ──────────────────────────────────────────────
router.get('/token/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { rows } = await db.query(`
      ${BOOKING_SELECT}
      WHERE b.reschedule_token = $1 AND b.status = 'scheduled'
    `, [token]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found or already cancelled' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ──────────────────────────────────────────────
// PUT /token/:token  — Reschedule by token
// ──────────────────────────────────────────────
router.put('/token/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { start_time, end_time } = req.body;

    // Find existing booking
    const existing = await db.query(
      "SELECT id, event_type_id FROM bookings WHERE reschedule_token = $1 AND status = 'scheduled'",
      [token]
    );
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found or already cancelled' });
    }

    const { id, event_type_id } = existing.rows[0];

    // Overlap check (exclude self)
    if (await hasOverlap(event_type_id, start_time, end_time, id)) {
      return res.status(409).json({ error: 'New time slot is already booked.' });
    }

    // Update times only — keep meeting_link, platform, etc.
    await db.query(
      'UPDATE bookings SET start_time = $1, end_time = $2 WHERE id = $3',
      [start_time, end_time, id]
    );

    // Fetch updated booking for response + email
    const { rows } = await db.query(`${BOOKING_SELECT} WHERE b.id = $1`, [id]);
    const booking = rows[0];

    // Send reschedule email (non-blocking)
    sendRescheduleConfirmation(booking).catch(err => {
      console.error('[Email] Background reschedule email failed:', err.message);
    });

    res.json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ──────────────────────────────────────────────
// GET /:id  — Get a single booking by ID
// ──────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await db.query(`
      ${BOOKING_SELECT}
      WHERE b.id = $1 AND b.status = 'scheduled'
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ──────────────────────────────────────────────
// POST /  — Create or Reschedule a booking
// ──────────────────────────────────────────────
router.post('/', async (req, res) => {
  const client = await db.getClient();
  try {
    const { event_type_id, name, email, start_time, end_time, reschedule_id, role } = req.body;

    await client.query('BEGIN');

    let rescheduled_from = null;
    let oldBooking = null;

    if (reschedule_id) {
      const { rows } = await client.query('SELECT * FROM bookings WHERE id = $1', [reschedule_id]);
      if (rows.length === 0) {
        throw new Error('Original booking not found');
      }
      oldBooking = rows[0];

      // Security check for User role
      if (role === 'user' && oldBooking.email.toLowerCase() !== email.toLowerCase()) {
        return res.status(403).json({ error: 'You are not authorized to reschedule this meeting.' });
      }

      rescheduled_from = oldBooking.id;
    }

    // Double booking prevention
    const excludeIds = rescheduled_from ? [rescheduled_from] : [];
    if (await hasOverlap(event_type_id, start_time, end_time, excludeIds)) {
      return res.status(409).json({ error: 'Time slot is already booked.' });
    }

    // Fetch event type config
    const eventTypeQuery = await client.query(
      'SELECT name, slug, meeting_mode, platform, location, custom_link, duration FROM event_types WHERE id = $1',
      [event_type_id]
    );
    if (eventTypeQuery.rows.length === 0) {
      return res.status(404).json({ error: 'Event type not found' });
    }
    const eventType = eventTypeQuery.rows[0];
    const mode = eventType.meeting_mode || 'online';

    // If rescheduling, use same link if possible, else generate new
    let meeting_link = oldBooking?.meeting_link || null;
    let booking_location = oldBooking?.location || eventType.location || null;
    let platform = oldBooking?.platform || eventType.platform || null;

    if (mode === 'online' && !meeting_link) {
      meeting_link = generateMeetingLink(platform, eventType.custom_link);
    }

    // Mark old as rescheduled
    if (rescheduled_from) {
      await client.query("UPDATE bookings SET status = 'rescheduled' WHERE id = $1", [rescheduled_from]);
    }

    // Generate new reschedule token
    const reschedule_token = crypto.randomBytes(32).toString('hex');

    const { rows } = await client.query(
      `INSERT INTO bookings 
        (event_type_id, name, email, start_time, end_time, meeting_mode, meeting_link, platform, location, reschedule_token, status, rescheduled_from) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'scheduled', $11) 
       RETURNING *`,
      [event_type_id, name, email, start_time, end_time, mode, meeting_link, platform, booking_location, reschedule_token, rescheduled_from]
    );

    const booking = {
      ...rows[0],
      invoke_name: rows[0].name,
      event_name: eventType.name,
      slug: eventType.slug,
      duration: eventType.duration,
    };

    await client.query('COMMIT');

    // Send email
    if (rescheduled_from) {
      sendRescheduleConfirmation(booking).catch(err => console.error('[Email] Reschedule failed:', err.message));
    } else {
      sendBookingConfirmation(booking).catch(err => console.error('[Email] Booking confirmation failed:', err.message));
    }

    res.status(201).json(booking);
  } catch (err) {
    await client.query('ROLLBACK');
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Time slot is already booked.' });
    }
    console.error(err);
    res.status(500).json({ error: err.message || 'Server error' });
  } finally {
    client.release();
  }
});

// ──────────────────────────────────────────────
// PUT /:id  — Reschedule by ID (admin/internal)
// ──────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { start_time, end_time } = req.body;

    const bookingQuery = await db.query(
      "SELECT event_type_id FROM bookings WHERE id = $1 AND status = 'scheduled'",
      [id]
    );
    if (bookingQuery.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    const { event_type_id } = bookingQuery.rows[0];

    // Overlap check (exclude self)
    if (await hasOverlap(event_type_id, start_time, end_time, id)) {
      return res.status(409).json({ error: 'New time slot is already booked.' });
    }

    await db.query(
      'UPDATE bookings SET start_time = $1, end_time = $2 WHERE id = $3',
      [start_time, end_time, id]
    );

    const { rows } = await db.query(`${BOOKING_SELECT} WHERE b.id = $1`, [id]);
    const booking = rows[0];

    sendRescheduleConfirmation(booking).catch(() => { });

    res.json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ──────────────────────────────────────────────
// DELETE /:id  — Cancel (soft delete)
// ──────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch booking data before cancelling (for email)
    const { rows } = await db.query(`${BOOKING_SELECT} WHERE b.id = $1`, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const booking = rows[0];

    // Soft delete
    await db.query("UPDATE bookings SET status = 'cancelled' WHERE id = $1", [id]);

    // Send cancellation email (non-blocking)
    sendCancellationNotice(booking).catch(err => {
      console.error('[Email] Background cancellation email failed:', err.message);
    });

    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
