import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const supabase = await createClient();

        // Fetch Service Requests with related profiles
        const { data, error } = await supabase
            .from('service_requests')
            .select(`
                *,
                profiles:client_id (full_name, email, phone_number, room_number)
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
