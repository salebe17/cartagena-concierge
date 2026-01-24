import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
    // Sanitize URL (Fix for common copy-paste error where '=' is included)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/^=/, '').trim();

    return createBrowserClient(
        supabaseUrl!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
}
