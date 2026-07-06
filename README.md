PaisaTrack — Project Roadmap
Phase 1 — Project Setup ✅

Created monorepo structure paisatrack/client + paisatrack/server
Initialized Node.js backend with npm init
Installed all dependencies — Express, pg, JWT, bcrypt, cors, helmet, dotenv
Created full folder structure — routes, controllers, services, middleware, db, config

Phase 2 — Database Setup ✅

Installed PostgreSQL 17 + pgAdmin
Created paisatrack database
Connected Node.js to PostgreSQL via pg Pool
Wrote and ran migrations — created users, categories, expenses tables
Seeded 8 default categories — Food, Grocery, Travel, Rent, Shopping, Entertainment, Health, Other

Phase 3 — Auth API 🔲

POST /api/auth/register — name, email, password
POST /api/auth/login — returns JWT token
JWT middleware — protects all private routes
Password hashing with bcrypt

Phase 4 — Expense API 🔲

POST /api/expenses/parse — sends raw input to Claude AI, returns parsed JSON
POST /api/expenses — saves confirmed expense to DB
GET /api/expenses?month= — fetch expenses by month
PUT /api/expenses/:id — edit expense
DELETE /api/expenses/:id — delete expense

Phase 5 — Categories API 🔲

GET /api/categories — fetch all categories for logged in user
POST /api/categories — create new category
PUT /api/categories/:id — rename category
DELETE /api/categories/:id — delete category

Phase 6 — Analytics API 🔲

GET /api/analytics/summary?month= — total + per category breakdown
GET /api/analytics/compare?month= — current vs previous month
AI generated plain English summary via Claude API

Phase 7 — React Frontend 🔲

Vite + React + TypeScript + Tailwind setup
Login + Register pages
Home page — expense input + AI parse + confirm card + expense list
This Month page — donut chart + AI summary
History page — month navigator + comparison

Phase 8 — AI Integration 🔲

Claude API integration in ai.service.js
Natural language parsing — "onion 50" → { item: Onion, amount: 50, category: Grocery }
Handles Hinglish input
Monthly summary generation
Graceful error handling if AI fails

Phase 9 — Production Ready 🔲

Environment validation on startup
Global error handling middleware
Input validation on all routes
API rate limiting
CORS properly configured
.gitignore — never push .env or node_modules

Phase 10 — Deployment 🔲

Backend — Railway or Render
Frontend — Vercel
Database — Supabase or Railway PostgreSQL
Environment variables configured on hosting platform

user1
{
  "name": "Sakshi",
  "email": "sakshi@test.com",
  "password": "sakshi123"
}

{
    "name":"Punit",
    "email":"punit@gmail.com",
    "password":"punit123"

}