'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { ActionResponse, ServiceRequest } from '@/lib/types';

// Helper for BigInt serialization
function serialize<T>(data: T): T {
    try {
        return JSON.parse(JSON.stringify(data, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ));
    } catch (e) {
        console.error("Serialization Error:", e);
        return data; // Return original if serialization fails (better than crash, though risks client error)
    }
}

export async function getAllServiceRequests(): Promise<ServiceRequest[]> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return [];

        // Verify admin role with single efficient query
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'admin') return [];

        // RLS Enabled Fetch
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
        return []; // Standardize empty return on error
    }
}

export async function getAllBookings(): Promise<any[]> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return [];

        // Verify admin role 
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'admin') return [];

        // Fetch All Bookings
        const { data, error } = await supabase
            .from('bookings')
            .select(`
                *,
                properties (
                    title,
                    address
                )
            `)
            .order('start_date', { ascending: true }); // Future bookings first? No, list all sorted by date.

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

        // Verify admin role
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'admin') return { success: false, error: "Acceso denegado: Se requieren permisos de administrador." };

        const { error } = await supabase
            .from('service_requests')
            .update({ status: newStatus })
            .eq('id', requestId);

        if (error) throw error;

        revalidatePath('/admin');
        revalidatePath('/dashboard'); // Update host view context
        return { success: true };
    } catch (e: any) {
        return { success: false, error: "Error al actualizar el estado." };
    }
}

export async function forceSyncAllCalendars(): Promise<ActionResponse> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return { success: false, error: "No autorizado" };

        // Verify admin role
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'admin') return { success: false, error: "Requiere privilegios de Admin" };

        // We need the sync logic. Dynamically import to avoid top-level circular deps if any.
        const { syncPropertyCalendar } = await import('@/app/actions');

        // Fetch all properties with iCal URLs
        const { data: properties } = await supabase
            .from('properties')
            .select('id, title')
            .not('ical_url', 'is', null);

        if (!properties || properties.length === 0) {
            return { success: true, message: "No hay propiedades con iCal configurado." };
        }

        // Optimización: Paralelismo controlado para evitar Timeout de Vercel (10s)
        const TIMEOUT_MS = 8000; // 8 segundos de seguridad
        const syncPromises = properties.map(async (prop) => {
            try {
                await syncPropertyCalendar(prop.id);
                return { id: prop.id, title: prop.title, success: true };
            } catch (err) {
                console.error(`Error syncing prop ${prop.title}:`, err);
                return { id: prop.id, title: prop.title, success: false };
            }
        });

        // Race between sync and timeout
        const timeoutPromise = new Promise((resolve) =>
            setTimeout(() => resolve('TIMEOUT'), TIMEOUT_MS)
        );

        const result = await Promise.race([Promise.all(syncPromises), timeoutPromise]);

        if (result === 'TIMEOUT') {
            return { success: true, message: "Sincronización parcial (Tiempo límite excedido). Recargue en unos segundos." };
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
        console.error("Force Sync Critical Error:", e);
        return { success: false, error: "Error crítico: " + e.message };
    }
}
