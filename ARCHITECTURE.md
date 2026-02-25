# FairBid (former Cartagena Concierge) - System Architecture

This document describes the high-level C4 Model architecture for the FairBid platform, utilizing Next.js, Supabase, and a Realtime Bidding Engine.

## Level 1: System Context

```mermaid
C4Context
  title System Context diagram for FairBid

  Person(client, "Client", "A customer needing an immediate home service.")
  Person(technician, "Technician", "A verified professional offering services.")
  System(fairbid, "FairBid Platform", "Allows clients to post jobs and technicians to bid on them in real-time.")
  System_Ext(stripe, "Stripe", "Handles payments and escrow.")
  System_Ext(supabase, "Supabase", "Backend-as-a-Service (Auth, DB, Realtime).")

  Rel(client, fairbid, "Requests service & accepts bids")
  Rel(technician, fairbid, "Views radar & submits bids")
  Rel(fairbid, stripe, "Processes payments")
  Rel(fairbid, supabase, "Reads/Writes data, subscribes to websockets")
```

## Level 2: Container Diagram

```mermaid
C4Container
  title Container diagram for FairBid Platform

  Person(user, "User", "Client or Technician")

  System_Boundary(c1, "FairBid") {
    Container(web_app, "Web Application", "Next.js (React Server Components)", "Delivers the user interface globally via Vercel Edge CDN.")
    Container(api, "API Routes & Actions", "Next.js Server Actions", "Handles business logic, Zod validation, and secure db calls.")
    Container(state, "Global State", "Zustand", "Manages active UI roles and websocket status.")
  }

  System_Boundary(c2, "Backend (Supabase)") {
    ContainerDb(database, "PostgreSQL DB", "PostgreSQL 15", "Stores users, profiles, service_requests, and bids.")
    Container(realtime, "Realtime Engine", "Elixir", "Broadcasts bid events to connected WebSockets.")
    Container(auth, "Auth API", "GoTrue", "Handles JWT issuance and validation.")
  }

  Rel(user, web_app, "Visits", "HTTPS")
  Rel(web_app, state, "Reads/Updates", "Zustand")
  Rel(web_app, api, "Invokes Server Actions", "HTTPS")
  Rel(web_app, realtime, "Subscribes to channels", "WSS")
  Rel(api, database, "SQL Queries / RLS", "TCP/IP")
  Rel(realtime, database, "Listens to WAL", "Logical Replication")
  Rel(web_app, auth, "Authenticates", "HTTPS")
```

## Technical Decisions

- **Strict TypeScript**: `noImplicitAny` and `strict` modes enforced to prevent runtime type errors.
- **Zod Validation**: All API inputs and database writes are validated generically via `src/lib/validations.ts`.
- **Error Boundaries**: Root and granular boundaries ensure localized failures do not crash the React tree.
- **State Management**: `Zustand` limits React Context re-renders for core UI toggles.
