import { createClient, createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { fetchICalEvents } from '@/lib/ical-sync';

export const runtime = 'nodejs';

async function syncPropertyCalendarInternal(supabase: any, propertyId: string) {
    // 1. Get Property
    const { data: property, error: propError } = await supabase
        .from('properties')
        .select('ical_url, owner_id, title')
        .eq('id', propertyId)
        .single();

    if (propError || !property?.ical_url) return { error: "No iCal configured" };

    // 2. Fetch External Events
    const externalEvents = await fetchICalEvents(property.ical_url);

    // 3. Process Events
    let newBookingsCount = 0;
    for (const event of externalEvents) {
        if (!event.start || !event.end || isNaN(event.start.getTime()) || isNaN(event.end.getTime())) {
            console.warn(`Skipping invalid event: ${event.summary}`);
            continue;
        }

        const startIso = event.start.toISOString().split('T')[0];
        const endIso = event.end.toISOString().split('T')[0];

        // Duplicate Check
        const { data: existing } = await supabase
            .from('bookings')
            .select('id')
            .eq('property_id', propertyId)
            .eq('external_id', event.uid)
            .single();

        if (!existing) {
            const { data: newBooking } = await supabase
                .from('bookings')
                .insert({
                    property_id: propertyId,
                    start_date: startIso,
                    end_date: endIso,
                    guest_name: event.summary,
                    external_id: event.uid,
                    platform: 'iCal Sync',
                    status: 'confirmed'
                })
                .select('id')
                .single();

            if (newBooking) {
                newBookingsCount++;
                // Alert owner
                await supabase.from('alerts').insert({
                    user_id: property.owner_id,
                    property_id: propertyId,
                    booking_id: newBooking.id,
                    title: "Servicio Pendiente",
                    message: `Nueva reserva (iCal): ${event.summary} (${startIso} - ${endIso})`,
                    type: 'pending_service'
                });
            }
        }
    }
    return { success: true };
}

export async function POST(request: Request) {
    try {
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

        // Use Admin Client to see ALL properties regardless of RLS
        const { data: properties } = await dbClient
            .from('properties')
            .select('id, title')
            .not('ical_url', 'is', null);

        if (!properties || properties.length === 0) {
            return NextResponse.json({ success: true, message: "No hay propiedades con iCal configurado." });
        }

        const GLOBAL_TIMEOUT = 55000; // 55s (Vercel limit is 60s for hobby)
        const PER_CALENDAR_TIMEOUT = 10000; // 10s per calendar

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), GLOBAL_TIMEOUT);

        const syncPromises = properties.map(async (prop: any) => {
            try {
                // Use a race for individual fetch if supported, or just rely on global strict limit
                // Ideally propagate signal to fetchICalEvents if it supports init options
                // For now, wrapper:
                const calResult = await Promise.race([
                    syncPropertyCalendarInternal(dbClient, prop.id),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), PER_CALENDAR_TIMEOUT))
                ]);
                return { id: prop.id, title: prop.title, success: true };
            } catch (err: any) {
                return { id: prop.id, title: prop.title, success: false, error: err.message };
            }
        });

        const results = await Promise.all(syncPromises);
        clearTimeout(timeoutId);

        const successCount = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success)
            .map(r => `${r.title}`);

        let msg = `Sincronizadas: ${successCount}.`;
        if (failed.length > 0) msg += ` Fallos/Timeouts: ${failed.join(', ')}.`;

        return NextResponse.json({ success: true, message: msg });

    } catch (e: any) {
        if (e.name === 'AbortError') {
            return NextResponse.json({ success: false, error: "Global Sync Timeout (55s limit)" }, { status: 504 });
        }
        console.error("[API] Critical Sync Error:", e);
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
