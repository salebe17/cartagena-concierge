'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface Ally {
    id: string;
    name: string;
    category: 'transport' | 'chef' | 'boat' | 'wellness' | 'tours' | 'other';
    description: string;
    image_url: string;
    perk_description: string;
    contact_phone: string;
    requires_reservation: boolean;
}

export async function getAllies() {
    const supabase = await createClient();

    // In a real scenario, we might want to cache this
    const { data, error } = await supabase
        .from('allies')
        .select('*')
        .eq('is_active', true)
        .order('name');

    if (error) {
        console.error("Error fetching allies:", error);
        return { success: false, data: [] };
    }

    return { success: true, data: data as Ally[] };
}

export async function createReservation(allyId: string, details: { guest_name: string, date: Date, guests: number, notes: string }) {
    const supabase = await createClient();

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Unauthorized");

        // 1. Create Reservation Request
        const { data, error } = await supabase
            .from('reservations')
            .insert({
                host_id: user.id,
                ally_id: allyId,
                guest_name: details.guest_name,
                requested_date: details.date.toISOString(),
                guest_count: details.guests,
                notes: details.notes,
                status: 'pending'
            })
            .select()
            .single();

        if (error) throw error;

        revalidatePath('/dashboard');
        return { success: true, reservationId: data.id };

    } catch (error: any) {
        console.error("Error creating reservation:", error);
        return { success: false, error: "No se pudo crear la solicitud." };
    }
}

export async function generateReferralCode(allyId: string) {
    const supabase = await createClient();

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
