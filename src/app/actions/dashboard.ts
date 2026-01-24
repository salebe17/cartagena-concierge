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

export async function createServiceRequest(formData: FormData) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) return { error: "No autorizado" };

        const propertyId = formData.get('propertyId') as string;
        const serviceType = formData.get('serviceType') as string;
        const date = formData.get('date') as string;
        const notes = formData.get('notes') as string;

        const { error } = await supabase.from('service_requests').insert({
            property_id: propertyId,
            service_type: serviceType,
            notes: notes,
            requested_date: new Date(date).toISOString(),
            status: 'pending'
        });

        if (error) throw error;

        revalidatePath('/dashboard');
        return { success: true };
    } catch (e: any) {
        console.error("Create Service Request Error:", e);
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
