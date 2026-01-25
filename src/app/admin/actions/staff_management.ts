'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { ActionResponse } from '@/lib/types'

export type StaffMember = {
    id: string;
    full_name: string;
    role: string;
    status: string;
    phone?: string;
    email?: string;
    avatar_url?: string;
    rating: number;
    created_at: string;
}

export async function getStaffMembers(): Promise<ActionResponse<StaffMember[]>> {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('staff_members')
            .select('*')
            .order('full_name', { ascending: true });

        if (error) throw error;
        return { success: true, data };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function createStaffMember(data: Partial<StaffMember>): Promise<ActionResponse> {
    try {
        const supabase = await createClient();
        const { error } = await supabase
            .from('staff_members')
            .insert(data);

        if (error) throw error;
        revalidatePath('/admin');
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function updateStaffMember(id: string, data: Partial<StaffMember>): Promise<ActionResponse> {
    try {
        const supabase = await createClient();
        const { error } = await supabase
            .from('staff_members')
            .update(data)
            .eq('id', id);

        if (error) throw error;
        revalidatePath('/admin');
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function deleteStaffMember(id: string): Promise<ActionResponse> {
    try {
        const supabase = await createClient();
        const { error } = await supabase
            .from('staff_members')
            .delete()
            .eq('id', id);

        if (error) throw error;
        revalidatePath('/admin');
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}
