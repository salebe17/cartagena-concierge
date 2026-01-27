import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
    // Sanitize URL (Fix for common copy-paste error where '=' is included)
    let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/^=/, '').trim();

    // FORCE HTTPS (Production Logic fix)
    // "The operation is insecure" happens if connecting to ws:// from https://
    // Ensuring https:// here ensures Supabase uses wss://
    if (supabaseUrl && !supabaseUrl.startsWith('https://') && !supabaseUrl.startsWith('http://localhost')) {
        supabaseUrl = supabaseUrl.replace(/^http:\/\//, 'https://');
        if (!supabaseUrl.startsWith('https://')) {
            supabaseUrl = `https://${supabaseUrl}`;
        }
    }

    return createBrowserClient(
        supabaseUrl!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
}
