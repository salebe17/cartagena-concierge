import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  // Build-safe check: Return a stub client if env vars are missing
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn("Supabase Env Vars missing. Using stub client for build.");
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        getSession: async () => ({ data: { session: null }, error: null }),
      },
      from: () => ({
        select: () => ({ eq: () => ({ single: () => ({ data: null, error: null }), maybeSingle: () => ({ data: null }) }) }),
      })
    } as any;
  }

  // Sanitize URL (Fix for common copy-paste error where '=' is included)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!.replace(/^=/, '').trim();

  return createServerClient(
    supabaseUrl,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
