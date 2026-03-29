# Schedulr (Calendly Clone)

A premium, full-stack scheduling and booking Single Page Application (SPA) built with Next.js, Express, and PostgreSQL, designed to visually and functionally resemble Calendly's modern SaaS logic and UI patterns.

## Tech Stack
- **Frontend**: Next.js (App Router), React, Tailwind CSS 4, Framer Motion (for high-fidelity fluid transitions), date-fns, Lucide React.
- **Backend**: Node.js, Express.js, PostgreSQL (pg).
- **Database Architecture**: Neon Serverless Postgres. Custom scalable relational schema design (`bookings`, `event_types`, `availability`).

## Core Features Implemented
- **Event Types Management**: Create, edit, list, and delete event types with dynamically generated unique URL slugs.
- **Availability Settings**: Set default weekly hours (Start/End limits), toggle active days, and configure global timezones for accurate slot mapping.
- **Public Booking Page**: Frictionless shareable link (`/book/:slug`) containing a full month calendar grid. Time slots strictly generated dynamically by checking duration limits natively against SQL overlap blocks.
- **Meetings Dashboard**: Animated toggle to view past and upcoming bookings, with instant localized cancellation.
- **Double-booking Prevention**: Layered protection using both temporal overlap bounds in Node.js and strict `UNIQUE` Postgres constraints.

## Setup Instructions

### 1. Database & Backend Engine
1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   npm install
   ```
2. Create a `.env` file referencing your PostgreSQL connection string:
   ```env
   PORT=5000
   DATABASE_URL=postgres://username:password@localhost:5432/calendly
   ```
3. Initialize the schema and seed standard event types automatically:
   ```bash
   node scripts/init-db.js
   ```
4. Start the backend:
   ```bash
   npm start
   ```

### 2. Frontend Interface
1. Navigate to the `calendly/` frontend application:
   ```bash
   cd calendly
   npm install
   ```
2. Set the backend routing endpoint in a `.env` file (the system defaults to `5000` locally):
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```
3. Boot the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to view the Schedulr platform.

## Design Decisions & Assumptions
- **Authentication**: Fully bypassed for the sake of the assignment, defaulting to a highly secure admin view on the root `/dashboard` URL. Public booking runs passively without login.
- **SPA Flow**: Native Next.js App Router utilizes a persistent template to achieve complete structural fade transitions without traditional browser reloads.
- **Booking Bounds**: Slots sequentially step linearly by exact event duration (e.g. 30m slots run precisely 09:00, 09:30, 10:00). Past dates and mathematically overloaded times (conflicts) are automatically muted on the grid calendar.
