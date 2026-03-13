# Hotel Jay Suites - Smart Hotel Operations Platform

A production-quality front desk management system built for Hotel Jay Suites. Manages rooms, guests, reservations, check-in/check-out, and billing.

## Tech Stack

| Layer     | Technology                                              |
|-----------|--------------------------------------------------------|
| Frontend  | React 19, TypeScript, Vite, TailwindCSS v4, Recharts  |
| Backend   | Node.js, Express, TypeScript, Prisma ORM, Zod          |
| Database  | PostgreSQL (Supabase or Docker)                        |

## Quick Start (Local Development)

### Prerequisites
- Node.js 20+
- PostgreSQL 16 (or Docker)

### 1. Clone & install dependencies

```bash
# Backend
cd backend
cp .env .env.local   # adjust DATABASE_URL if needed
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Set up the database

```bash
cd backend

# Apply schema
npx prisma db push

# Seed with sample data
npm run db:seed
```

### 3. Start development servers

```bash
# Terminal 1 - Backend (port 3001)
cd backend
npm run dev

# Terminal 2 - Frontend (port 5173)
cd frontend
npm run dev
```

### 4. Open the app

Navigate to **http://localhost:5173**

**Login credentials:**
| Role          | Email                    | Password      |
|--------------|--------------------------|---------------|
| Admin        | admin@jaysuites.com      | admin123      |
| Receptionist | reception@jaysuites.com  | reception123  |

## Using Docker

```bash
docker compose up -d
```

This starts PostgreSQL, backend, and frontend. Access the app at **http://localhost:5173**.

## Project Structure

```
Hotel Project/
├── backend/
│   ├── prisma/          # Schema + migrations + seed
│   ├── src/
│   │   ├── config/      # Environment config
│   │   ├── middleware/   # Auth, validation, error handling
│   │   ├── routes/      # API route definitions
│   │   ├── controllers/ # Request handlers
│   │   ├── services/    # Business logic
│   │   ├── schemas/     # Zod validation schemas
│   │   └── utils/       # Prisma client, JWT helpers
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/  # Layout + reusable components
│   │   ├── pages/       # Page components
│   │   ├── hooks/       # React Query data hooks
│   │   ├── lib/         # API client, auth, utilities
│   │   └── types/       # TypeScript interfaces
│   └── vercel.json
├── docker-compose.yml
└── render.yaml
```

## API Endpoints

| Module        | Endpoints |
|---------------|-----------|
| Auth          | `POST /api/auth/login`, `GET /api/auth/me` |
| Rooms         | CRUD `/api/rooms`, CRUD `/api/rooms/types` |
| Guests        | CRUD `/api/guests` with search |
| Reservations  | CRUD `/api/reservations`, check-in, check-out, cancel, calendar |
| Invoices      | List/detail `/api/invoices`, add items, update payment |
| Dashboard     | `/api/dashboard/stats`, trends, room-status, recent |

## Deployment

| Service   | Platform | Config            |
|-----------|----------|-------------------|
| Frontend  | Vercel   | `vercel.json`     |
| Backend   | Render   | `render.yaml`     |
| Database  | Supabase | PostgreSQL        |

Set `VITE_API_URL` in Vercel to your Render backend URL.
Set `DATABASE_URL` in Render to your Supabase connection string.
