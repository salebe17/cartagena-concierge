import { createClient, createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { id, status } = body;

        console.log(`[API] Admin Update Request: ${id} -> ${status}`);

        if (!id || !status) {
            return NextResponse.json({ success: false, error: "Missing parameters" }, { status: 400 });
        }

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        // Admin Check
        const dbClient = await createAdminClient();

        // Verify Admin Role
        const { data: profile } = await dbClient
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'admin') {
            return NextResponse.json({ success: false, error: "Forbidden: Admin only" }, { status: 403 });
        }

        // Perform Update
        const { error } = await dbClient
            .from('service_requests')
            .update({ status })
            .eq('id', id);

        if (error) {
            console.error("[API] DB Update Error:", error);
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });

    } catch (e: any) {
        console.error("[API] Critical Error:", e);
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
