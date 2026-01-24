'use server'

import { createClient } from '@/lib/supabase/server'

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
