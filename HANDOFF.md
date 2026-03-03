# 📦 Cartagena Concierge — Developer Handoff

> ⚠️ **CONFIDENTIAL** — This document contains architecture and onboarding info for the incoming developer. Do NOT commit `.env.local` to git.

---

## 1. Project Overview

**Cartagena Concierge** (internally also referenced as "FairBid") is a premium, role-based Progressive Web App (PWA) for secure concierge/delivery services in Cartagena.

### Key Features

- 🔐 **Role-Based Access Control (RBAC):** User / Driver / Admin
- 🪪 **KYC Wall:** Users must upload ID + Selfie before ordering
- 📍 **Real-Time Order Tracking:** Powered by Supabase Realtime (WebSockets)
- 🔢 **4-Digit PIN Delivery Verification**
- 📱 **PWA + Capacitor:** Installable on iOS and Android
- 💳 **Stripe Payments:** Live integration (escrow + payments)
- 🤖 **AI Integration:** Vercel AI SDK + OpenAI

---

## 2. Tech Stack

| Layer           | Technology                             |
| --------------- | -------------------------------------- |
| Framework       | Next.js 16 (App Router) / React 19     |
| Language        | TypeScript (strict mode)               |
| Database & Auth | Supabase (PostgreSQL + RLS + Realtime) |
| Payments        | Stripe (currently in LIVE mode)        |
| Styling         | TailwindCSS v4 + Radix UI / shadcn     |
| State           | Zustand                                |
| Animations      | Framer Motion                          |
| Maps            | Leaflet + React-Leaflet                |
| AI              | Vercel AI SDK (`@ai-sdk/openai`)       |
| Mobile          | Capacitor (Android/iOS)                |
| Testing         | Playwright (E2E)                       |
| CI / Deployment | Vercel + Docker                        |

---

## 3. Project Structure

```
cartagena-concierge/
├── src/
│   ├── app/          # Next.js App Router pages and API routes
│   ├── components/   # Shared React components
│   ├── hooks/        # Custom React hooks
│   ├── lib/          # Utilities, Supabase client, Stripe, validators
│   ├── scripts/      # Utility scripts
│   └── middleware.ts # Auth middleware (RBAC enforcement)
├── supabase/         # DB migrations and config
├── tests/            # Playwright E2E tests
├── k6/               # Load testing scripts
├── public/           # PWA icons, manifests
├── ARCHITECTURE.md   # C4 architecture diagrams (Mermaid)
├── DEPLOYMENT.md     # Vercel / Docker deployment steps
└── ANDROID_BUILD_GUIDE.md
```

---

## 4. Local Setup

### Prerequisites

- Node.js >= 20
- npm or pnpm
- A Supabase project (URL + keys)
- A Stripe account (test or live keys)

### Steps

```bash
# 1. Clone or receive the project folder
cd cartagena-concierge

# 2. Copy the environment file and fill in your keys
cp .env.local.example .env.local

# 3. Install dependencies
npm install

# 4. Run database migrations
npx supabase db push   # (if using Supabase CLI)

# 5. Start dev server
npm run dev
# → App runs at http://localhost:3000
```

---

## 5. Environment Variables (`.env.local`)

The current `.env.local` is configured with **LIVE** credentials. Do NOT expose them.

| Variable                             | Description                             |
| ------------------------------------ | --------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`           | Supabase project URL                    |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`      | Supabase public anon key                |
| `SUPABASE_SERVICE_ROLE_KEY`          | Supabase service role key (server only) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (currently LIVE) |
| `STRIPE_SECRET_KEY`                  | Stripe secret key (currently LIVE)      |
| `STRIPE_WEBHOOK_SECRET`              | Stripe webhook signing secret           |

> ⚠️ Stripe is currently in **LIVE mode**. Switch to `pk_test_...` / `sk_test_...` keys during development to avoid real charges.

---

## 6. User Roles Setup (Supabase)

All roles are stored in the `profiles` table. To assign roles:

```sql
-- Promote to driver
UPDATE profiles SET role = 'driver' WHERE email = 'driver@example.com';

-- Promote to admin
UPDATE profiles SET role = 'admin' WHERE email = 'admin@example.com';

-- Regular users sign up via Magic Link email
```

---

## 7. Current Status (as of handoff)

- ✅ Dev server starts cleanly (`Ready in ~13s`)
- ✅ All dependencies installed (`node_modules` present)
- ✅ `.env.local` configured with live Supabase + Stripe keys
- ✅ Git history present (`.git/`)
- ✅ Playwright E2E tests configured
- ✅ Docker + Vercel deployment configs present
- ⚠️ Some TypeScript warnings exist (`typescript_errors.txt`) — non-blocking
- ⚠️ Lint warnings present (`lint.log`) — non-blocking

---

## 8. Deployment

See `DEPLOYMENT.md` for full instructions. Quick summary:

```bash
# Vercel (recommended)
vercel deploy --prod

# Docker
docker-compose up --build
```

---

## 9. Key Files to Review First

1. `src/middleware.ts` — Auth + RBAC enforcement logic
2. `src/app/` — All page routes
3. `supabase/` — DB schema and migrations
4. `ARCHITECTURE.md` — Full system diagram
