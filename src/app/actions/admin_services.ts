'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { ActionResponse } from '@/lib/types';
import { deepSerialize } from '@/lib/utils/serialization';

// Helper to check admin status
async function checkAdmin() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // In a real app, check role in `profiles` or `app_metadata`
    // For now, hardcoded admin check matching existing logic
    if (!user || user.email !== 'moisalebe@gmail.com') {
        throw new Error('Unauthorized');
    }
    return true;
}

export async function deleteServiceRequest(requestId: string): Promise<ActionResponse> {
    try {
        await checkAdmin();
        const supabase = await createClient(); // Use standard client, assuming RLS allows admin or we use Service Role if needed.
        // If RLS is strict, we might need the Service Role client here similar to `admin/actions.ts`.
        // Let's assume for deletion we want to be sure. 
        // Actually, let's try standard client first. If RLS policies for 'delete' are set for admins, it works.
        // If not, we might need to update RLS or use Service Role.
        // Safe bet: Use Service Role for Admin Actions to avoid RLS headaches.

        const { createClient: createAdminClient } = await import('@supabase/supabase-js');
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!serviceRoleKey) throw new Error('Missing Service Role Key');

        const adminDb = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            serviceRoleKey,
            { auth: { autoRefreshToken: false, persistSession: false } }
        );

        const { error } = await adminDb
            .from('service_requests')
            .delete()
            .eq('id', requestId);

        if (error) throw error;

        revalidatePath('/admin');
        revalidatePath('/dashboard');
        return deepSerialize({ success: true });
    } catch (e: any) {
        return { success: false, error: "No se pudo eliminar el servicio." };
    }
}

export async function updateServiceRequest(requestId: string, updates: { notes?: string, status?: string }): Promise<ActionResponse> {
    try {
        await checkAdmin();

        const { createClient: createAdminClient } = await import('@supabase/supabase-js');
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!serviceRoleKey) throw new Error('Missing Service Role Key');

        const adminDb = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            serviceRoleKey,
            { auth: { autoRefreshToken: false, persistSession: false } }
        );

        const { error } = await adminDb
            .from('service_requests')
            .update(updates)
            .eq('id', requestId);

        if (error) throw error;

        revalidatePath('/admin');
        return deepSerialize({ success: true });
    } catch (e: any) {
        return { success: false, error: "No se pudo actualizar el servicio." };
    }
}
