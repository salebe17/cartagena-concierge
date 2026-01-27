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
        const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
        let dbClient = supabase;
        if (hasServiceKey) {
            const adminClient = await createAdminClient();
            dbClient = adminClient;
        }

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

        const TIMEOUT_MS = 30000;
        const syncPromises = properties.map(async (prop: any) => {
            try {
                // Pass correct client to internal sync
                await syncPropertyCalendarInternal(dbClient, prop.id);
                return { id: prop.id, title: prop.title, success: true };
            } catch (err: any) {
                console.error(`Sync error ${prop.title}:`, err);
                return { id: prop.id, title: prop.title, success: false, error: err.message };
            }
        });

        const timeoutPromise = new Promise((resolve) =>
            setTimeout(() => resolve('TIMEOUT'), TIMEOUT_MS)
        );

        const result = await Promise.race([Promise.all(syncPromises), timeoutPromise]);

        if (result === 'TIMEOUT') {
            return NextResponse.json({ success: true, message: "Sincronización parcial (Timeout)." });
        }

        const results = result as any[];
        const successCount = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success)
            .map(r => `${r.title} (${r.error || 'Unknown'})`);
        const succeeded = results.filter(r => r.success).map(r => r.title);

        let msg = `Sincronizadas: ${successCount} de ${properties.length}.`;
        if (succeeded.length > 0) msg += ` (${succeeded.join(', ')})`;
        if (failed.length > 0) msg += ` Fallaron: ${failed.join(', ')}.`;

        console.log(`[API] Sync Completed: ${msg}`);
        return NextResponse.json({ success: true, message: msg });

    } catch (e: any) {
        console.error("[API] Critical Sync Error:", e);
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
