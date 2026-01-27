# Deployment Guide: Cartagena Concierge

## 1. Database Setup (Supabase)
Run the master schema script in your Supabase SQL Editor. This single file sets up tables, security, extensions, and storage.

```bash
supabase/production_schema_v1.sql
```

## 2. Environment Variables
Ensure your hosting platform (Vercel) has these variables:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=... (For Admin API routes)
```

## 3. Storage Buckets
The schema script attempts to create the `chat-attachments` bucket.
If images fail to upload, go to Supabase Dashboard -> Storage -> Create Bucket: `chat-attachments` (Make Public).

## 4. Admin Access
To make yourself an admin, run this SQL after signing up:

```sql
UPDATE public.profiles SET role = 'admin' WHERE email = 'your-email@example.com';
```

## 5. Security & Maintenance
- **Maintenance Mode**: Can be toggled via `system_settings` table in DB.
- **Security Headers**: Already configured in `next.config.js`.

---
*Built with ❤️ by Antigravity Agent.*
