import { createClient, createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { property_id, service_type, notes, requested_date } = body;

        if (!property_id || !service_type || !requested_date) {
            return NextResponse.json({ success: false, error: "Missing parameters" }, { status: 400 });
        }

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        // Admin Check
        const dbClient = await createAdminClient();
        const { data: profile } = await dbClient
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'admin') {
            return NextResponse.json({ success: false, error: "Forbidden: Admin only" }, { status: 403 });
        }

        // Date Validation (Timezone Safe: Colombia UTC-5)
        const reqDate = new Date(requested_date);

        // Get current time in Colombia
        const now = new Date();
        const colombiaOffset = -5 * 60; // UTC-5 in minutes
        const localNow = new Date(now.getTime() + (colombiaOffset * 60 * 1000));
        localNow.setUTCHours(0, 0, 0, 0); // Start of today in Colombia time

        // Adjust reqDate to compare dates only
        const reqLocal = new Date(reqDate.getTime());
        reqLocal.setUTCHours(0, 0, 0, 0);

        if (reqLocal < localNow) {
            return NextResponse.json({ success: false, error: "No se pueden crear solicitudes en fechas pasadas." }, { status: 400 });
        }

        // Create range for the requested day
        const startOfDay = new Date(reqDate);
        startOfDay.setUTCHours(0, 0, 0, 0);
        const endOfDay = new Date(reqDate);
        endOfDay.setUTCHours(23, 59, 59, 999);

        const { data: existing } = await dbClient
            .from('service_requests')
            .select('id')
            .eq('property_id', property_id)
            .eq('service_type', service_type)
            .neq('status', 'cancelled')
            .gte('requested_date', startOfDay)
            .lte('requested_date', endOfDay)
            .maybeSingle();

        if (existing) {
            return NextResponse.json({ success: false, error: "Ya existe una solicitud duplicada para esta fecha." }, { status: 409 });
        }

        // Create Request
        const { data: newRequest, error } = await dbClient
            .from('service_requests')
            .insert({
                property_id,
                service_type,
                notes: notes || "Generado desde Calendario",
                requested_date,
                status: 'pending'
            })
            .select(`
                *,
                properties (
                    id,
                    title,
                    address,
                    owner_id
                )
            `)
            .single();

        if (error) {
            console.error("[API] Create Request Error:", error);
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, data: newRequest, message: "Solicitud creada exitosamente" });

    } catch (e: any) {
        console.error("[API] Critical Create Request Error:", e);
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
