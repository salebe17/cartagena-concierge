import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { fetchICalEvents } from '@/lib/ical-sync';

// Force Node.js runtime for iCal processing
export const runtime = 'nodejs';

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        // Fetch properties owned by this user that have an iCal URL
        const { data: properties, error: propError } = await supabase
            .from('properties')
            .select('id, title, ical_url')
            .eq('owner_id', user.id)
            .not('ical_url', 'is', null);

        if (propError) throw propError;

        if (!properties || properties.length === 0) {
            return NextResponse.json({ success: true, message: "No tieenes propiedades con iCal para sincronizar." });
        }

        let bookingsCreated = 0;
        const results = [];

        // Process each property
        for (const property of properties) {
            try {
                // Fetch events
                const events = await fetchICalEvents(property.ical_url);

                for (const event of events) {
                    if (!event.start || !event.end || isNaN(event.start.getTime()) || isNaN(event.end.getTime())) continue;

                    const startIso = event.start.toISOString().split('T')[0];
                    const endIso = event.end.toISOString().split('T')[0];

                    // Check if booking exists (Dedup)
                    const { data: existing } = await supabase
                        .from('bookings')
                        .select('id')
                        .eq('property_id', property.id)
                        .eq('external_id', event.uid)
                        .single();

                    if (!existing) {
                        // Create Booking
                        const { data: newBooking, error: insertError } = await supabase
                            .from('bookings')
                            .insert({
                                property_id: property.id,
                                start_date: startIso,
                                end_date: endIso,
                                guest_name: event.summary || 'Reserva Externa',
                                external_id: event.uid,
                                platform: 'iCal Sync',
                                status: 'confirmed'
                            })
                            .select()
                            .single();

                        if (newBooking) {
                            bookingsCreated++;
                            // Create Alert
                            await supabase.from('alerts').insert({
                                user_id: user.id,
                                property_id: property.id,
                                booking_id: newBooking.id,
                                title: "Nueva Reserva Sincronizada",
                                message: `Reserva de ${event.summary} recibida desde Airbnb/iCal.`,
                                type: 'info'
                            });

                            // AUTO-SCHEDULE CLEANING
                            // Schedule for 11:00 AM on checkout date
                            const [cy, cm, cd] = endIso.split('-').map(Number);
                            const cleaningDate = new Date(cy, cm - 1, cd, 11, 0, 0);

                            await supabase.from('service_requests').insert({
                                property_id: property.id,
                                service_type: 'cleaning',
                                status: 'pending',
                                requested_date: cleaningDate.toISOString(),
                                notes: `Limpieza de salida automática (Sync) para reserva: ${event.summary || 'Externo'}`
                            });
                        }
                    }
                }
                results.push({ id: property.id, title: property.title, status: 'synced' });

            } catch (err: any) {
                console.error(`Error syncing property ${property.id}:`, err);
                results.push({ id: property.id, title: property.title, status: 'error', error: err.message });
            }
        }

        return NextResponse.json({
            success: true,
            message: `Sincronización completada. ${bookingsCreated} nuevas reservas encontradas.`,
            details: results
        });

    } catch (e: any) {
        console.error("Host Sync Error:", e);
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
