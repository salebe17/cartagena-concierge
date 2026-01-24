
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRequests() {
    console.log('Checking service requests...');

    // 1. Fetch all requests ignoring RLS? No, client always respects RLS unless using service role.
    // We don't have service role key in env vars usually exposed to client context, but let's see if we can find any.

    // Attempt with anonymous client (will only see what anon/public is allowed, likely nothing if RLS is on and no auth)
    // Wait, I can't easily masquerade as admin here without signing in.

    // Better approach: Check if "Express Cleaning" uses a specific service_type value that receives special handling?

    const { data, error } = await supabase.from('service_requests').select('*');
    console.log('Anon select result:', { data, error });
}

checkRequests();
