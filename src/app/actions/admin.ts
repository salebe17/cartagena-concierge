'use server'

import { ActionResponse, ServiceRequest } from '@/lib/types';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
// import { fetchICalEvents } from '@/lib/ical-sync'; // <-- Removed to avoid build-time eval

// --- HELPERS ---

// Helper for BigInt serialization
function serialize<T>(data: T): T {
    try {
        return JSON.parse(JSON.stringify(data, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ));
    } catch (e) {
        console.error("Serialization Error:", e);
        return data; // Return original if serialization fails
    }
}

// Internal Sync Logic (Uses authenticated session)
async function syncPropertyCalendarInternal(supabase: any, propertyId: string) {
    // Dynamic import to avoid build evaluation errors with node-ical
    const { fetchICalEvents } = await import('@/lib/ical-sync');

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

// --- EXPORTED ACTIONS ---

// ... imports


// ... (helpers)

// --- EXPORTED ACTIONS ---

export async function getAllServiceRequests(): Promise<ServiceRequest[]> {
    try {
        const supabase = await createClient(); // Authenticated User Client
        const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;

        let dbClient = supabase;
        if (hasServiceKey) {
            const adminSupabase = await createAdminClient();
            dbClient = adminSupabase;
        }

        // 1. Auth Check (Always use User Client for this)
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        // 2. Role Check (Verify user is admin)
        // Ensure we check profile using the client that has access to it.
        // If we use RLS, authenticated 'supabase' can read profiles.
        // If we use Service Key, 'adminSupabase' can read profiles.
        const { data: profile } = await dbClient
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'admin') return [];

        // 3. Data Fetch
        const { data, error } = await dbClient
            .from('service_requests')
            .select(`
                *,
                properties (
                    id,
                    title,
                    address,
                    owner_id
                ),
                service_logs (
                    id,
                    started_at,
                    ended_at,
                    staff_name,
                    notes,
                    start_photos,
                    end_photos
                )
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return serialize(data || []);
    } catch (e) {
        console.error("Admin Fetch Error:", e);
        return [];
    }
}

export async function getAllBookings(): Promise<any[]> {
    try {
        const supabase = await createClient();
        const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;

        let dbClient = supabase;
        if (hasServiceKey) {
            const adminSupabase = await createAdminClient();
            dbClient = adminSupabase;
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        const { data: profile } = await dbClient
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'admin') return [];

        const { data, error } = await dbClient
            .from('bookings')
            .select(`
                *,
                properties (
                    title,
                    address
                )
            `)
            .order('start_date', { ascending: true });

        if (error) throw error;
        return serialize(data || []);
    } catch (e) {
        console.error("Admin Bookings Fetch Error:", e);
        return [];
    }
}

export async function adminUpdateServiceStatus(requestId: string, newStatus: string): Promise<ActionResponse> {
    try {
        const supabase = await createClient();
        const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;

        let dbClient = supabase;
        if (hasServiceKey) {
            const adminSupabase = await createAdminClient();
            dbClient = adminSupabase;
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, error: "No autorizado" };

        const { data: profile } = await dbClient
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'admin') return { success: false, error: "Requiere admin" };

        const { error } = await dbClient
            .from('service_requests')
            .update({ status: newStatus })
            .eq('id', requestId);

        if (error) throw error;

        revalidatePath('/admin');
        revalidatePath('/dashboard');
        return { success: true };
    } catch (e: any) {
        return { success: false, error: "Error al actualizar el estado." };
    }
}

export async function forceSyncAllCalendars(): Promise<ActionResponse> {
    try {
        const supabase = await createClient();
        const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;

        let dbClient = supabase;
        if (hasServiceKey) {
            const adminSupabase = await createAdminClient();
            dbClient = adminSupabase;
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, error: "No autorizado" };

        const { data: profile } = await dbClient
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'admin') return { success: false, error: "Requiere admin" };

        // Use Admin Client to see ALL properties regardless of RLS
        const { data: properties } = await dbClient
            .from('properties')
            .select('id, title')
            .not('ical_url', 'is', null);

        if (!properties || properties.length === 0) {
            return { success: true, message: "No hay propiedades con iCal configurado." };
        }

        const TIMEOUT_MS = 9000;
        const syncPromises = properties.map(async (prop) => {
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
            return { success: true, message: "Sincronización parcial (Timeout)." };
        }

        const results = result as any[];
        const successCount = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success)
            .map(r => `${r.title} (${r.error || 'Unknown'})`);
        const succeeded = results.filter(r => r.success).map(r => r.title);

        let msg = `Sincronizadas: ${successCount} de ${properties.length}.`;
        if (succeeded.length > 0) msg += ` (${succeeded.join(', ')})`;
        if (failed.length > 0) msg += ` Fallaron: ${failed.join(', ')}.`;

        revalidatePath('/admin');
        return { success: true, message: msg };

    } catch (e: any) {
        return { success: false, error: "Error crítico: " + e.message };
    }
}

// ... debugEnvVars ...

export async function adminCreateServiceRequest(data: {
    property_id: string;
    service_type: 'cleaning' | 'maintenance' | 'concierge';
    notes?: string;
    requested_date: string; // ISO string
}): Promise<ActionResponse<any>> {
    const supabase = await createClient();
    const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;

    let dbClient = supabase;
    if (hasServiceKey) {
        const adminSupabase = await createAdminClient();
        dbClient = adminSupabase;
    }

    // 1. Auth Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "No autenticado" };

    // 2. Role Check
    const { data: profile } = await dbClient
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'admin') {
        return { success: false, error: "No tiene permisos de administrador" };
    }

    // 3. Create Request
    const { data: newRequest, error } = await dbClient
        .from('service_requests')
        .insert({
            property_id: data.property_id,
            service_type: data.service_type,
            notes: data.notes || "Generado desde Calendario",
            requested_date: data.requested_date,
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
        console.error("Error creating request:", error);
        return { success: false, error: error.message };
    }

    revalidatePath('/admin');
    return { success: true, data: newRequest, message: "Solicitud creada exitosamente" };
}
