'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache';

// Helper for BigInt serialization (Crucial for Build Stability)
function serialize<T>(data: T): T {
    return JSON.parse(JSON.stringify(data, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
    ));
}

export async function getUserPropertiesBySession() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    try {
        const { data } = await supabase
            .from('properties')
            .select('*')
            .eq('owner_id', user.id);

        return serialize(data || []);
    } catch (e) {
        console.error("Get Properties By Session Error:", e);
        return [];
    }
}

export async function getUserAlertsBySession() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    try {
        const { data } = await supabase
            .from('alerts')
            .select('*, properties(title)')
            .eq('user_id', user.id)
            .eq('status', 'unread')
            .order('created_at', { ascending: false });

        return serialize(data || []);
    } catch (e) {
        console.error("Get Alerts By Session Error:", e);
        return [];
    }
}

export async function registerProperty(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Debes iniciar sesión" };

    const title = formData.get('title') as string;
    const address = formData.get('address') as string;
    const ical_url = formData.get('ical_url') as string;

    if (!title || !address) return { error: "Faltan datos obligatorios" };

    try {
        const { error } = await supabase.from('properties').insert({
            owner_id: user.id,
            title,
            address,
            ical_url: ical_url || null
        });

        if (error) throw error;

        // Revalidate to update dashboard immediately
        // We use a hacky revalidatePath('/') or specific path
        // But since we are in `use server`, revalidatePath needs imports
    } catch (e: any) {
        return { error: e.message };
    }

    return { success: true };
}

export async function submitServiceRequest(propertyId: string, serviceType: string, date: string, notes: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Unauthorized" };

    try {
        // Reuse ORDERS table for services as it has payment/status logic
        const { error } = await supabase.from('orders').insert({
            user_id: user.id,
            // We store property_id in metadata or description for now if no column
            // Ideal: Add property_id to orders. 
            // Workaround: Add to service_details
            service_details: `[${serviceType.toUpperCase()}] ${notes} (Fecha: ${date}) - Propiedad: ${propertyId}`,
            amount: 0, // Quote pending
            total_amount: 0,
            service_fee: 0,
            delivery_fee: 0,
            status: 'pending',
            delivery_code: 'REQ-' + Math.floor(Math.random() * 1000),
            client_phone: user.user_metadata?.phone || '', // Fallback
            // If we have property_id column in orders (we verified we don't, only properties table has owner_id)
            // Ideally we should LINK them.
        });

        if (error) throw error;

        // Also create an ALERT for the admin/user
        await supabase.from('alerts').insert({
            user_id: user.id,
            title: 'Solicitud Recibida',
            message: `Hemos recibido tu solicitud de ${serviceType}. Coordinaremos la visita para el ${date}.`,
            type: 'info'
        });

    } catch (e: any) {
        return { error: e.message };
    }

    return { success: true };
}
