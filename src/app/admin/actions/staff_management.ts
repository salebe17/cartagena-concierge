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
    metrics?: {
        totalJobs: number;
        avgCompletionTimeMinutes: number;
    }
}

export async function getStaffMembers(): Promise<ActionResponse<StaffMember[]>> {
    try {
        const supabase = await createClient();
        const { data: staff, error: staffError } = await supabase
            .from('staff_members')
            .select('*')
            .order('full_name', { ascending: true });

        if (staffError) throw staffError;

        // Fetch logs to calculate metrics
        const { data: logs, error: logsError } = await supabase
            .from('service_logs')
            .select('staff_member_id, started_at, ended_at')
            .not('ended_at', 'is', null)
            .not('started_at', 'is', null);

        if (logsError) throw logsError;

        const staffWithMetrics = (staff || []).map((member: StaffMember) => {
            const memberLogs = (logs || []).filter((l: any) => l.staff_member_id === member.id);
            const totalJobs = memberLogs.length;
            let avgTime = 0;
            if (totalJobs > 0) {
                const totalMinutes = memberLogs.reduce((acc: number, log: any) => {
                    const start = log.started_at ? new Date(log.started_at).getTime() : 0;
                    const end = log.ended_at ? new Date(log.ended_at).getTime() : 0;
                    const duration = end - start;
                    return acc + (duration / 1000 / 60);
                }, 0);
                avgTime = totalMinutes / totalJobs;
            }
            return {
                ...member,
                metrics: {
                    totalJobs,
                    avgCompletionTimeMinutes: Math.round(avgTime)
                }
            };
        });

        return { success: true, data: staffWithMetrics };
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
