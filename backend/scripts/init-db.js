const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function initDB() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log("Connecting to database:", process.env.DATABASE_URL.split('@')[1]);
    await client.connect();

    console.log('Running schema.sql...');
    const schema = fs.readFileSync(path.join(__dirname, '../db/schema.sql'), 'utf-8');
    await client.query(schema);

    console.log('Running seed.sql...');
    const seed = fs.readFileSync(path.join(__dirname, '../db/seed.sql'), 'utf-8');
    await client.query(seed);

    console.log('Database initialized and seeded successfully!');
  } catch (err) {
    console.error('Error initializing data base:', err);
  } finally {
    await client.end();
  }
}

initDB();
