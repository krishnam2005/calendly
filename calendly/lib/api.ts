const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const api = {
  // Events
  getEvents: async () => {
    const res = await fetch(`${API_URL}/events`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch events');
    return res.json();
  },
  getEventBySlug: async (slug) => {
    const res = await fetch(`${API_URL}/events/${slug}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Event not found');
    return res.json();
  },
  createEvent: async (data) => {
    const res = await fetch(`${API_URL}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  updateEvent: async (id, data) => {
    const res = await fetch(`${API_URL}/events/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  deleteEvent: async (id) => {
    const res = await fetch(`${API_URL}/events/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete event');
    return true;
  },

  // Availability
  getAvailability: async () => {
    const res = await fetch(`${API_URL}/availability`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch availability');
    return res.json();
  },
  updateAvailability: async (data) => {
    const res = await fetch(`${API_URL}/availability`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  deleteAvailability: async (dayOfWeek) => {
    const res = await fetch(`${API_URL}/availability/${dayOfWeek}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete availability');
    return true;
  },

  // Bookings
  getBookings: async () => {
    const res = await fetch(`${API_URL}/bookings`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch bookings');
    return res.json();
  },
  getBooking: async (id) => {
    const res = await fetch(`${API_URL}/bookings/${id}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Booking not found');
    return res.json();
  },
  getBookingById: async (id) => {
    const res = await fetch(`${API_URL}/bookings/${id}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Booking not found');
    return res.json();
  },
  getBookingByToken: async (token) => {
    const res = await fetch(`${API_URL}/bookings/token/${token}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Booking not found');
    return res.json();
  },
  createBooking: async (data) => {
    const res = await fetch(`${API_URL}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create booking');
    }
    return res.json();
  },
  cancelBooking: async (id) => {
    const res = await fetch(`${API_URL}/bookings/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to cancel meeting');
    return true;
  },
  rescheduleBooking: async (id, data) => {
    const res = await fetch(`${API_URL}/bookings/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to reschedule');
    return res.json();
  },
  rescheduleByToken: async (token, data) => {
    const res = await fetch(`${API_URL}/bookings/token/${token}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to reschedule');
    return res.json();
  },
};
