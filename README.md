# Cartagena Concierge 🛡️
> Premium Private Cash Delivery Service PWA

A secure, role-based Progressive Web App (PWA) built for exclusive concierge services in Cartagena.

## ✨ Features

- **Role-Based Access Control (RBAC):**
    - `Role: User` → Book orders, track delivery.
    - `Role: Driver` → Receive orders, navigate (Waze/Maps), verify via PIN.
    - `Role: Admin` → Dashboard for analytics and KYC approval.
- **Strict KYC Wall:** Users must verify Identity (ID + Selfie) before ordering.
- **Real-Time Order Tracking:** Live status updates.
- **Secure Delivery:** 4-Digit PIN verification required for completion.
- **PWA Ready:** Installable on iOS/Android with premium custom assets.

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Database & Auth:** Supabase (PostgreSQL, RLS Policy Secured)
- **Styling:** TailwindCSS + Shadcn/UI (Dark Mode Premium Aesthetic)
- **Deployment:** Vercel (Recommended)

## 🚀 Getting Started

### 1. Environment Setup
Rename `.env.local.example` to `.env.local` and add your keys:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```

## 📱 PWA Installation
- **iOS:** Open in Safari -> Share -> "Add to Home Screen"
- **Android:** Chrome Menu -> "Install App"

## 🔐 Accounts for Testing

- **User:** Sign up via Email Magic Link.
- **Driver:** Promote user in `profiles` table: `UPDATE profiles SET role = 'driver' WHERE email = '...';`
- **Admin:** Promote user in `profiles` table: `UPDATE profiles SET role = 'admin' WHERE email = '...';`

---
*Built by Agent Squad (Backend, Frontend, QA, CEO)*
