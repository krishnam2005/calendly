require('dotenv').config();
const { Pool } = require('pg');
const db = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

const chars = 'abcdefghijklmnopqrstuvwxyz';
const randChar = (n) => Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
const randNum = () => Math.floor(Math.random() * 9_000_000_000) + 1_000_000_000;

function generateLink(platform) {
  switch (platform) {
    case 'google_meet': return `https://meet.google.com/${randChar(3)}-${randChar(4)}-${randChar(3)}`;
    case 'zoom':        return `https://zoom.us/j/${randNum()}`;
    case 'teams':       return `https://teams.microsoft.com/l/meetup-join/19%3ameeting_${randChar(10)}%40thread.v2/0`;
    default:            return `https://meet.google.com/${randChar(3)}-${randChar(4)}-${randChar(3)}`;
  }
}

async function patch() {
  // Find all online bookings with broken/old links
  const { rows } = await db.query(`
    SELECT b.id, COALESCE(b.platform, e.platform, 'google_meet') AS platform
    FROM bookings b
    JOIN event_types e ON b.event_type_id = e.id
    WHERE COALESCE(b.meeting_mode, e.meeting_mode, 'online') = 'online'
      AND (b.meeting_link IS NULL OR b.meeting_link LIKE '%schedulr.com%')
  `);

  if (rows.length === 0) {
    console.log('No broken links found — all bookings look good.');
  }

  for (const row of rows) {
    const newLink = generateLink(row.platform);
    await db.query(`UPDATE bookings SET meeting_link = $1, platform = $2 WHERE id = $3`, [newLink, row.platform, row.id]);
    console.log(`✓ Fixed booking ${row.id} [${row.platform}] → ${newLink}`);
  }
  console.log('Done.');
  await db.end();
}

patch().catch(e => { console.error(e.message); db.end(); });
