'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProfileAvatar(avatarUrl: string) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Unauthorized" };
    }

    // 1. Update Profiles Table
    try {
        const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
                id: user.id,
                avatar_url: avatarUrl,
                updated_at: new Date().toISOString()
            });

        if (profileError) {
            console.error("Profile update error:", profileError);
            // We don't throw yet, we try metadata update too
        }

        // 2. Update Auth Metadata (Backup)
        const { error: authError } = await supabase.auth.updateUser({
            data: { avatar_url: avatarUrl }
        });

        if (authError) {
            console.error("Auth metadata update error:", authError);
            if (profileError) throw profileError; // Throw if both failed
        }

        revalidatePath('/dashboard');
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function updateProfileInfo(data: { name: string; phone: string; bio: string }) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const { error } = await supabase
            .from('profiles')
            .upsert({
                id: user.id,
                full_name: data.name,
                phone: data.phone,
                bio: data.bio,
                updated_at: new Date().toISOString()
            });

        if (error) throw error;

        revalidatePath('/dashboard');
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}
