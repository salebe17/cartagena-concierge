'use server';

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProfileAvatar(avatarUrl: string) {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.error("CRITICAL: SUPABASE_SERVICE_ROLE_KEY is missing.");
        return { success: false, error: "Configuration Error: Service Key Missing on Server." };
    }

    const supabase = await createClient(); // Keep normal client for auth check
    const adminDb = await createAdminClient(); // Admin for writing

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Unauthorized" };
    }

    // 1. Update Profiles Table (Using Admin to bypass infinite recursion/RLS)
    try {
        const { error: profileError } = await adminDb
            .from('profiles')
            .upsert({
                id: user.id,
                avatar_url: avatarUrl,
                updated_at: new Date().toISOString()
            });

        if (profileError) {
            console.error("Profile update error:", profileError);
        }

        // 2. Update Auth Metadata (Using Admin - Force Write to DB)
        const { error: authError } = await adminDb.auth.admin.updateUserById(
            user.id,
            { user_metadata: { avatar_url: avatarUrl } }
        );

        if (authError) {
            console.error("Auth metadata update error:", authError);
            if (profileError) throw profileError;
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
