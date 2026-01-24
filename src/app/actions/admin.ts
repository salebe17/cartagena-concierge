'use server'

import { ActionResponse, ServiceRequest } from '@/lib/types';
import { createClient } from '@/lib/supabase/server';
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

// Dedicated Admin Client Helper (Avoids circular deps with actions.ts)
async function getSupabaseAdmin() {
    const { createClient } = await import('@supabase/supabase-js');

    const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const rawKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!rawUrl) throw new Error("Falta NEXT_PUBLIC_SUPABASE_URL.");

    if (!rawKey) {
        // SECURITY DEBUG: List keys to see what IS available (names only)
        const availableKeys = Object.keys(process.env)
            .filter(k => k.startsWith('NEXT_') || k.startsWith('SUPABASE_') || k.startsWith('VERCEL_'))
            .join(', ');

        throw new Error(`Falta SUPABASE_SERVICE_ROLE_KEY. Keys disponibles: [${availableKeys}]`);
    }

    // Sanitize URL
    const supabaseUrl = rawUrl.replace(/^=/, '').trim();
    // Sanitize Key (remove accidental quotes or spaces)
    const supabaseKey = rawKey.replace(/^["']|["']$/g, '').trim();

    return createClient(
        supabaseUrl,
        supabaseKey,
        { auth: { autoRefreshToken: false, persistSession: false } }
    );
}

// Internal Sync Logic (Isolated)
async function syncPropertyCalendarInternal(propertyId: string) {
    const supabase = await getSupabaseAdmin();
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

export async function getAllServiceRequests(): Promise<ServiceRequest[]> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return [];

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'admin') return [];

        const { data, error } = await supabase
            .from('service_requests')
            .select(`
                *,
                properties (
                    id,
                    title,
                    address,
                    owner_id
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
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return [];

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'admin') return [];

        const { data, error } = await supabase
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
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return { success: false, error: "No autorizado" };

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'admin') return { success: false, error: "Requiere admin" };

        const { error } = await supabase
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
        // Authenticate as normal user first
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return { success: false, error: "No autorizado" };

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'admin') return { success: false, error: "Requiere admin" };

        // Fetch properties using Admin Client (bypass RLS)
        const adminSupabase = await getSupabaseAdmin();
        const { data: properties } = await adminSupabase
            .from('properties')
            .select('id, title')
            .not('ical_url', 'is', null);

        if (!properties || properties.length === 0) {
            return { success: true, message: "No hay propiedades con iCal configurado." };
        }

        // Parallel Sync with Timeout
        const TIMEOUT_MS = 9000;
        const syncPromises = properties.map(async (prop) => {
            try {
                await syncPropertyCalendarInternal(prop.id);
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
        const failed = results.filter(r => !r.success).map(r => r.title);
        const succeeded = results.filter(r => r.success).map(r => r.title);

        let msg = `Sincronizadas: ${successCount} de ${properties.length}.`;
        if (succeeded.length > 0) msg += ` (${succeeded.join(', ')})`;
        if (failed.length > 0) msg += ` Fallaron: ${failed.join(', ')}.`;

        revalidatePath('/admin');
        return { success: true, message: msg };

    } catch (e: any) {
        const errorMessage = e instanceof Error ? e.message : "Unknown error";
        return { success: false, error: "Error crítico: " + errorMessage };
    }
}

export async function debugEnvVars() {
    // SECURITY: Return ONLY names, never values
    const keys = Object.keys(process.env).filter(k => k.startsWith('NEXT_') || k.startsWith('SUPABASE_'));
    const serviceKeyExists = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    const serviceKeyLength = process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0;

    return {
        keys,
        hasServiceKey: serviceKeyExists,
        keyLength: serviceKeyLength,
        nodeEnv: process.env.NODE_ENV
    };
}
