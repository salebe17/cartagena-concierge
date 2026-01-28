'use server';

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export interface Ally {
    id: string;
    name: string;
    category: 'transport' | 'chef' | 'boat' | 'wellness' | 'tours' | 'other';
    description: string;
    image_url: string;
    perk_description: string;
    contact_phone: string; // Only revealed after code generation? Or we send user to WhatsApp with pre-filled message including code.
}

export async function getAllies() {
    const supabase = createClient();

    // In a real scenario, we might want to cache this
    const { data, error } = await supabase
        .from('allies')
        .select('*')
        .eq('is_active', true)
        .order('name');

    if (error) {
        console.error("Error fetching allies:", error);
        return { success: false, error: "No se pudieron cargar los aliados." };
    }

    return { success: true, data: data as Ally[] };
}

export async function generateReferralCode(allyId: string) {
    const supabase = createClient();

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Unauthorized");

        // Generate a random 4-char code suffix
        const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
        // Prefix could be category based, but generic is fine.
        const code = `VIP-${suffix}`;

        const { data, error } = await supabase
            .from('referrals')
            .insert({
                host_id: user.id,
                ally_id: allyId,
                code: code,
                status: 'generated'
            })
            .select('code, id')
            .single();

        if (error) throw error;

        // Log the intent (Audit Trail)
        await supabase.from('marketplace_logs').insert({
            referral_id: data.id,
            action: 'code_generated',
            actor_id: user.id
        });

        revalidatePath('/dashboard');
        return { success: true, code: data.code };

    } catch (error: any) {
        console.error("Error generating referral:", error);
        return { success: false, error: "Error generando el código." };
    }
}
