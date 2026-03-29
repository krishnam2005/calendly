# 🚀 Schedulr — Calendly Clone

A **premium full-stack scheduling and booking platform** inspired by Calendly, built with modern technologies and production-grade architecture.

Schedulr enables users to create event types, define availability, and share booking links — all wrapped in a seamless, high-performance Single Page Application (SPA).

---

## ✨ Live Demo

🔗 *Add your deployed link here*

---

## 📌 Overview

Schedulr replicates **core SaaS scheduling workflows** with a strong focus on:

* ⚡ Performance (Next.js App Router + server components)
* 🎯 UX Precision (Framer Motion animations + clean UI)
* 🔒 Data Integrity (PostgreSQL constraints + backend validation)
* 🌍 Real-world usability (Timezone-aware scheduling)

---

## 🛠️ Tech Stack

### Frontend

* **Next.js (App Router)**
* **React**
* **Tailwind CSS v4**
* **Framer Motion**
* **date-fns**
* **Lucide React**

### Backend

* **Node.js**
* **Express.js**
* **PostgreSQL (pg)**

### Database Infrastructure

* **Neon Serverless Postgres**
* Optimized relational schema:

  * `event_types`
  * `bookings`
  * `availability`

---

## 🔥 Core Features

### 📅 Event Types Management

* Create, edit, delete event types
* Auto-generated **unique slugs**
* Custom duration & metadata per event

---

### ⏰ Availability Configuration

* Weekly availability setup
* Active/inactive day toggles
* Timezone-aware scheduling system
* Start/end boundary enforcement

---

### 🌐 Public Booking Page

* Shareable booking URL:
  `/book/:slug`
* Full **calendar-based UI**
* Real-time **dynamic slot generation**
* Slot filtering based on:

  * Event duration
  * Existing bookings
  * Availability rules

---

### 📊 Meetings Dashboard

* View:

  * Upcoming bookings
  * Past bookings
* Smooth animated UI transitions
* Instant booking cancellation

---

### 🚫 Double Booking Prevention

* **Backend validation (Node.js)** for time overlaps
* **PostgreSQL UNIQUE constraints**
* Ensures strict consistency even under concurrent requests

---

## 🧠 System Design Highlights

* **Dynamic slot computation** instead of static storage
* **Stateless backend architecture**
* Clean separation of:

  * Scheduling logic
  * Availability rules
  * Booking validation

---

## ⚙️ Setup Instructions

### 1️⃣ Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:

```env
PORT=5000
DATABASE_URL=postgres://username:password@localhost:5432/calendly
```

Initialize database:

```bash
node scripts/init-db.js
```

Start backend:

```bash
npm start
```

---

### 2️⃣ Frontend Setup

```bash
cd calendly
npm install
```

Create `.env` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Run development server:

```bash
npm run dev
```

Open:

```
http://localhost:3000
```

---

## 📂 Project Structure

```
Schedulr/
├── backend/
│   ├── routes/
│   ├── controllers/
│   ├── db/
│   └── scripts/
│
├── calendly/
│   ├── app/
│   ├── components/
│   ├── utils/
│   └── styles/
```

---

## 🎯 Design Decisions & Assumptions

* ❌ Authentication intentionally skipped to focus on **core scheduling logic**
* ⏳ Slot generation is computed dynamically for **accuracy & scalability**
* 🌍 Timezone handled globally to avoid inconsistencies
* ⚡ Optimized for **low-latency booking experience**

---

## 🚧 Future Improvements

* 🔐 Authentication (JWT / OAuth)
* 📩 Email notifications (Resend / SMTP)
* 📆 Google Calendar integration
* 💳 Payments (Stripe integration)
* 👥 Multi-user support

---

## 🧑‍💻 Author

**Krishnam Gupta**
3rd Year CSE | Chandigarh University

* 💼 Aspiring Software Engineer
* 📊 Interested in Full Stack & Data Systems

---

## ⭐ Why This Project Stands Out

* Real-world SaaS product architecture
* Strong backend + database design
* Focus on scalability and correctness
* Clean UI/UX with production-level polish

---

> *This project demonstrates the ability to design and build scalable, real-world web applications with attention to both system design and user experience.*
ssed for the sake of the assignment, defaulting to a highly secure admin view on the root /dashboard URL. Public booking runs passively without login.
SPA Flow: Native Next.js App Router utilizes a persistent template to achieve complete structural fade transitions without traditional browser reloads.
Booking Bounds: Slots sequentially step linearly by exact event duration (e.g. 30m slots run precisely 09:00, 09:30, 10:00). Past dates and mathematically overloaded times (conflicts) are automatically muted on the grid calendar.
