-- Ensure event types exist
INSERT INTO event_types (name, duration, slug, meeting_mode, platform, location, custom_link) VALUES 
('15 Minute Meeting', 15, '15-min-meeting', 'online', 'google_meet', NULL, NULL),
('30 Minute Meeting', 30, '30-min-meeting', 'online', 'zoom', NULL, NULL),
('60 Minute Deep Dive', 60, '60-min-deep-dive', 'offline', NULL, 'Room 301, Block A', NULL)
ON CONFLICT (slug) DO NOTHING;

-- Seed default availability (Mon - Fri: 09:00 to 17:00, UTC)
INSERT INTO availability (day_of_week, start_time, end_time, timezone) VALUES 
(1, '09:00:00', '17:00:00', 'UTC'),
(2, '09:00:00', '17:00:00', 'UTC'),
(3, '09:00:00', '17:00:00', 'UTC'),
(4, '09:00:00', '17:00:00', 'UTC'),
(5, '09:00:00', '17:00:00', 'UTC')
ON CONFLICT (day_of_week) DO NOTHING;

-- Seed a future meeting (tomorrow at 10:00)
INSERT INTO bookings (event_type_id, name, email, start_time, end_time, meeting_mode, meeting_link, platform, location)
VALUES (
  (SELECT id FROM event_types WHERE slug = '30-min-meeting'),
  'John Doe',
  'john@example.com',
  CURRENT_DATE + INTERVAL '1 day' + INTERVAL '10 hours',
  CURRENT_DATE + INTERVAL '1 day' + INTERVAL '10 hours 30 minutes',
  'online',
  'https://zoom.us/j/123456789',
  'zoom',
  NULL
) ON CONFLICT DO NOTHING;

-- Seed a past meeting (yesterday at 14:00)
INSERT INTO bookings (event_type_id, name, email, start_time, end_time, meeting_mode, meeting_link, platform, location)
VALUES (
  (SELECT id FROM event_types WHERE slug = '15-min-meeting'),
  'Jane Smith',
  'jane@example.com',
  CURRENT_DATE - INTERVAL '1 day' + INTERVAL '14 hours',
  CURRENT_DATE - INTERVAL '1 day' + INTERVAL '14 hours 15 minutes',
  'online',
  'https://meet.schedulr.com/abc-defg-hij',
  'google_meet',
  NULL
) ON CONFLICT DO NOTHING;

-- Seed an offline meeting (day after tomorrow at 11:00)
INSERT INTO bookings (event_type_id, name, email, start_time, end_time, meeting_mode, meeting_link, platform, location)
VALUES (
  (SELECT id FROM event_types WHERE slug = '60-min-deep-dive'),
  'Alex Johnson',
  'alex@example.com',
  CURRENT_DATE + INTERVAL '2 days' + INTERVAL '11 hours',
  CURRENT_DATE + INTERVAL '2 days' + INTERVAL '12 hours',
  'offline',
  NULL,
  NULL,
  'Room 301, Block A'
) ON CONFLICT DO NOTHING;
