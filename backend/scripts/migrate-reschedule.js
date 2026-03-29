const db = require('../db');

async function migrate() {
  console.log('Running migration: add reschedule_token and status to bookings...');
  
  try {
    // Add reschedule_token column
    await db.query(`
      ALTER TABLE bookings 
      ADD COLUMN IF NOT EXISTS reschedule_token VARCHAR(64) UNIQUE
    `);
    console.log('✓ Added reschedule_token column');

    // Add status column
    await db.query(`
      ALTER TABLE bookings 
      ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'scheduled'
    `);
    console.log('✓ Added status column');

    // Backfill existing bookings with tokens
    const crypto = require('crypto');
    const { rows } = await db.query('SELECT id FROM bookings WHERE reschedule_token IS NULL');
    for (const row of rows) {
      const token = crypto.randomBytes(32).toString('hex');
      await db.query('UPDATE bookings SET reschedule_token = $1 WHERE id = $2', [token, row.id]);
    }
    console.log(`✓ Backfilled ${rows.length} existing bookings with tokens`);

    // Set status for any null rows
    await db.query("UPDATE bookings SET status = 'scheduled' WHERE status IS NULL");
    console.log('✓ Backfilled status column');

    console.log('Migration complete!');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    process.exit(0);
  }
}

migrate();
