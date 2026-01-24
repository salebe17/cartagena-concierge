import { NextResponse } from 'next/server';
import { getAdminClient } from '@/app/actions'; // Assuming this exists or can be imported

// Mock getAdminClient since it's an internal helper in actions.ts
// Usually we'd export it or use a common utility
async function getSupabaseAdmin() {
    const { createClient } = await import('@supabase/supabase-js');
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    );
}

export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        const supabase = await getSupabaseAdmin();
        const { data: properties, error } = await supabase
            .from('properties')
            .select('id')
            .not('ical_url', 'is', null);

        if (error) throw error;

        const results = [];
        const { syncPropertyCalendar } = await import('@/app/actions');

        for (const prop of properties) {
            const res = await syncPropertyCalendar(prop.id);
            results.push({ id: prop.id, ...res });
        }

        return NextResponse.json({
            success: true,
            synced: results.length,
            details: results
        });

    } catch (e: any) {
        console.error("Cron Sync Error:", e);
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
