-- Drop tables if they exist to start fresh
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS availability CASCADE;
DROP TABLE IF EXISTS event_types CASCADE;

CREATE TABLE event_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  duration INT NOT NULL, -- Duration in minutes
  slug VARCHAR(255) UNIQUE NOT NULL,
  meeting_mode VARCHAR(10) DEFAULT 'online', -- 'online' or 'offline'
  platform VARCHAR(50) DEFAULT 'google_meet', -- only for online
  location VARCHAR(500), -- only for offline
  custom_link VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE availability (
  id SERIAL PRIMARY KEY,
  day_of_week INT NOT NULL, -- 0=Sunday, 1=Monday, ..., 6=Saturday
  start_time TIME NOT NULL, -- e.g., '09:00:00'
  end_time TIME NOT NULL,   -- e.g., '17:00:00'
  timezone VARCHAR(100) DEFAULT 'UTC',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(day_of_week) -- Assuming one availability block per day for simplicity in a clone, though can be expanded.
);

CREATE TABLE bookings (
  id SERIAL PRIMARY KEY,
  event_type_id INT NOT NULL REFERENCES event_types(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  meeting_mode VARCHAR(10) DEFAULT 'online', -- 'online' or 'offline'
  meeting_link VARCHAR(500), -- only for online
  platform VARCHAR(50), -- only for online
  location VARCHAR(500), -- only for offline
  reschedule_token VARCHAR(64) UNIQUE, -- token for secure rescheduling
  status VARCHAR(20) DEFAULT 'scheduled', -- 'scheduled', 'cancelled', or 'rescheduled'
  rescheduled_from INT REFERENCES bookings(id), -- original booking id if this is a reschedule
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  -- Prevent double booking for the exact same event at the exact same start_time
  UNIQUE(event_type_id, start_time) 
);
