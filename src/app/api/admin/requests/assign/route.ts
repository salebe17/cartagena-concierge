import { createClient, createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { requestId, staffId } = body;

        if (!requestId || !staffId) {
            return NextResponse.json({ success: false, error: "Missing parameters" }, { status: 400 });
        }

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

        // Admin Check (Optional but recommended)
        const dbClient = await createAdminClient(); // Use admin client to ensure we can write ignoring some RLS if strict

        const { error } = await dbClient
            .from('service_requests')
            .update({ assigned_staff_id: staffId })
            .eq('id', requestId);

        if (error) {
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
