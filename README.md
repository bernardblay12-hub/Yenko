# Yɛnkɔ 🚕📦

> **Campus Ride & Delivery System for University Students (UMaT Tarkwa)**

Yɛnkɔ (Ghanaian Twi for *"Let's Go!"*) is an on-demand campus transport and logistics web application designed for university students, staff, and campus riders.

---

## ✨ Features

- **🚕 Campus Ride Booking**: Book instant passenger rides between halls, lecture faculties, and Tarkwa town market.
- **📦 Instant Room Delivery**: Request food, snacks, laundry, and books delivered direct to your hostel block room.
- **🚘 Transport Fleet Options**:
  - **Taxi / Car**: Door-to-door private rides.
  - **Bus / Shuttle**: Scheduled group campus shuttles.
  - **Express Motorbike**: Express trips and rapid parcel delivery.
  - **E-Bicycle**: Eco-friendly canteen & parcel courier.
- **📍 Pre-Mapped Campus Hotspots**: Includes UMaT designated locations (*Main Gate*, *KT Hall*, *SRID Hall*, *Gold Refinery Lab*, *Library*, *University Canteen*, *Town Market Junction*, *Administration Block*).
- **💳 Flexible Payments**: Instant MTN Mobile Money, Telecel Cash, or Cash on Arrival.
- **💎 Glassmorphic UI**: Styled with responsive layouts, dark/light theme support, and smooth micro-animations.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Styling**: TailwindCSS + Lucide Icons + Sonner
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL with RLS)
- **Runtime**: Node.js

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Configure `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Database Setup

Copy and execute the schema defined in `SUPABASE_SCHEMA.sql` inside your Supabase SQL Editor.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
