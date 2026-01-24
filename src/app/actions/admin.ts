'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Helper for BigInt serialization
function serialize<T>(data: T): T {
    return JSON.parse(JSON.stringify(data, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
    ));
}

export async function getAllServiceRequests() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            console.log("AdminSDK: No user found");
            return [];
        }

        // Verify admin role
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        console.log("AdminSDK: User Role:", profile?.role);

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

        if (error) {
            console.error("AdminSDK: Supabase Error:", error);
        }

        console.log("AdminSDK: Requests Found:", data?.length);
        console.log("AdminSDK: Raw Data Sample:", data?.[0]);

        return serialize(data || []);
    } catch (e) {
        console.error("Admin: Error fetching requests:", e);
        return [];
    }
}

export async function adminUpdateServiceStatus(requestId: string, newStatus: string) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return { error: "No autorizado" };

        // Verify admin role
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'admin') return { error: "Acceso denegado" };

        const { error } = await supabase
            .from('service_requests')
            .update({ status: newStatus })
            .eq('id', requestId);

        if (error) throw error;

        revalidatePath('/admin');
        revalidatePath('/dashboard'); // Update host view too
        return { success: true };
    } catch (e: any) {
        console.error("Admin: Error updating status:", e);
        return { error: e.message };
    }
}
