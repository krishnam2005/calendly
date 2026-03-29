const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

const allowedOrigins = [
  process.env.APP_URL?.replace(/\/$/, ''), // strip trailing slash
  'http://localhost:3000',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (Render health checks, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // In development or if APP_URL not set, allow all
    if (!process.env.APP_URL) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));
app.use(express.json());

// Basic health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Routes
const eventRoutes = require('./routes/events');
const availabilityRoutes = require('./routes/availability');
const bookingRoutes = require('./routes/bookings');

app.use('/api/events', eventRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/bookings', bookingRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
