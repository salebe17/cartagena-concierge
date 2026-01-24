'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// Helper for BigInt serialization (Crucial for Build Stability)
function serialize<T>(data: T): T {
    return JSON.parse(JSON.stringify(data, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
    ));
}

export async function getUserPropertiesBySession() {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return [];
        }

        const { data } = await supabase
            .from('properties')
            .select('*')
            .eq('owner_id', user.id);

        return serialize(data || []);
    } catch (e) {
        console.error("Critical Error in getUserPropertiesBySession:", e);
        return [];
    }
}

export async function getUserAlertsBySession() {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) return [];

        const { data } = await supabase
            .from('alerts')
            .select('*, properties(title)')
            .eq('user_id', user.id)
            .eq('status', 'unread')
            .order('created_at', { ascending: false });

        return serialize(data || []);
    } catch (e) {
        console.error("Critical Error in getUserAlertsBySession:", e);
        return [];
    }
}

export async function registerProperty(formData: FormData) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return { error: "Debes iniciar sesión" };

        const title = formData.get('title') as string;
        const address = formData.get('address') as string;
        const ical_url = formData.get('ical_url') as string;

        if (!title || !address) return { error: "Faltan datos obligatorios" };

        const { error } = await supabase.from('properties').insert({
            owner_id: user.id,
            title,
            address,
            ical_url: ical_url || null
        });

        if (error) throw error;

        revalidatePath('/dashboard');
        return { success: true };
    } catch (e: any) {
        console.error("Register Property Error:", e);
        return { error: e.message };
    }
}

export async function submitServiceRequest(propertyId: string, serviceType: string, date: string, notes: string) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) return { error: "No autorizado" };

        const { error } = await supabase.from('orders').insert({
            user_id: user.id,
            service_details: `[${serviceType.toUpperCase()}] ${notes} (Fecha: ${date}) - Propiedad: ${propertyId}`,
            amount: 0,
            total_amount: 0,
            service_fee: 0,
            delivery_fee: 0,
            status: 'pending',
            delivery_code: 'REQ-' + Math.floor(Math.random() * 1000),
            client_phone: user.user_metadata?.phone || '',
        });

        if (error) throw error;

        await supabase.from('alerts').insert({
            user_id: user.id,
            title: 'Solicitud Recibida',
            message: `Hemos recibido tu solicitud de ${serviceType}. Coordinaremos la visita para el ${date}.`,
            type: 'info'
        });

        revalidatePath('/dashboard');
        return { success: true };
    } catch (e: any) {
        console.error("Service Request Error:", e);
        return { error: e.message };
    }
}

export async function signOut() {
    try {
        const supabase = await createClient();
        await supabase.auth.signOut();
    } catch (e) {
        console.error("SignOut Error:", e);
    }
    return redirect('/login');
}
