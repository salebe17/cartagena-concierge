'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { ActionResponse, Property, ServiceRequest } from '@/lib/types';

// Helper for BigInt serialization
function serialize<T>(data: T): T {
    return JSON.parse(JSON.stringify(data, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
    ));
}

export async function getUserPropertiesBySession(): Promise<Property[]> {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) return [];

        const { data, error } = await supabase
            .from('properties')
            .select('*')
            .eq('owner_id', user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return serialize(data || []);
    } catch (e) {
        // Silent fail for data fetching to prevent UI crash, but log for monitoring
        console.error("Fetch Properties Error:", e);
        return [];
    }
    return serialize(data || []);
} catch (e) {
    // Silent fail for data fetching to prevent UI crash, but log for monitoring
    console.error("Fetch Properties Error:", e);
    return [];
}
}

export async function getOwnerBookings(): Promise<any[]> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        // Fetch bookings where property.owner_id = user.id
        // We can do this by joining properties
        const { data, error } = await supabase
            .from('bookings')
            .select(`
                *,
                properties!inner (
                    id,
                    title,
                    owner_id
                )
            `)
            .eq('properties.owner_id', user.id)
            .order('start_date', { ascending: true });

        if (error) throw error;
        return serialize(data || []);
    } catch (e) {
        console.error("Fetch Owner Bookings Error:", e);
        return [];
    }
}

export async function createServiceRequest(formData: FormData): Promise<ActionResponse> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return { success: false, error: "Debes iniciar sesión" };

        const propertyId = formData.get('propertyId') as string;
        const serviceType = formData.get('serviceType') as string;
        const date = formData.get('date') as string;
        const notes = formData.get('notes') as string;

        // 1. Security Check: Verify Property Ownership
        const { data: property } = await supabase
            .from('properties')
            .select('owner_id')
            .eq('id', propertyId)
            .single();

        if (!property || property.owner_id !== user.id) {
            return { success: false, error: "No tienes permiso para solicitar servicios en esta propiedad." };
        }

        // 2. Insert Request
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
        return { success: false, error: "Error al crear la solicitud. Intenta nuevamente." };
    }
}

export async function registerProperty(formData: FormData): Promise<ActionResponse> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return { success: false, error: "Debes iniciar sesión" };

        const title = formData.get('title') as string;
        const address = formData.get('address') as string;
        const ical_url = formData.get('ical_url') as string;

        if (!title || !address) return { success: false, error: "El título y la dirección son obligatorios." };

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
        return { success: false, error: "Error al registrar la propiedad." };
    }
}

export async function deleteProperty(propertyId: string): Promise<ActionResponse> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, error: "No autorizado" };

        const { error } = await supabase
            .from('properties')
            .delete()
            .eq('id', propertyId)
            .eq('owner_id', user.id); // Double check ownership via RLS/Query

        if (error) throw error;

        revalidatePath('/dashboard');
        return { success: true };
    } catch (e: any) {
        return { success: false, error: "No se pudo eliminar la propiedad." };
    }
}

export async function updatePropertyStatus(propertyId: string, status: 'occupied' | 'vacant'): Promise<ActionResponse> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, error: "No autorizado" };

        const { error } = await supabase
            .from('properties')
            .update({ status })
            .eq('id', propertyId)
            .eq('owner_id', user.id);

        if (error) throw error;

        revalidatePath('/dashboard');
        return { success: true };
    } catch (e: any) {
        return { success: false, error: "Error al actualizar estado." };
    }
}


export async function signOut() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    return redirect('/login');
}

// --- Alert Actions ---

export async function getUserAlerts(): Promise<any[]> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        const { data, error } = await supabase
            .from('alerts')
            .select('*')
            .eq('user_id', user.id)
            .eq('is_read', false)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return serialize(data || []);
    } catch (e) {
        console.error("Fetch Alerts Error:", e);
        return [];
    }
}

export async function markAlertRead(alertId: string): Promise<ActionResponse> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, error: "Unauthorized" };

        const { error } = await supabase
            .from('alerts')
            .update({ is_read: true })
            .eq('id', alertId)
            .eq('user_id', user.id);

        if (error) throw error;

        revalidatePath('/dashboard');
        return { success: true };
    } catch (e) {
        return { success: false, error: "Error updating alert" };
    }
}
