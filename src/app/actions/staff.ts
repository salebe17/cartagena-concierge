'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache';
import { ActionResponse } from '@/lib/types';

export async function startJob(requestId: string, staffName: string): Promise<ActionResponse> {
    try {
        const supabase = await createClient();

        // 1. Validate Request exists
        const { data: request, error: reqError } = await supabase
            .from('service_requests')
            .select('id, status')
            .eq('id', requestId)
            .single();

        if (reqError || !request) return { success: false, error: "Solicitud no encontrada" };

        // 2. Create Service Log
        const { data: log, error: logError } = await supabase
            .from('service_logs')
            .insert({
                service_request_id: requestId,
                started_at: new Date().toISOString(),
                staff_name: staffName, // Assuming we added this column or store in notes
                notes: `Iniciado por: ${staffName}`
            })
            .select()
            .single();

        if (logError) {
            console.error("Error creating log:", logError);
            return { success: false, error: "Error al iniciar el trabajo" };
        }

        // 3. Update Request Status to 'in_progress' optional, or just keep as confirmed
        // Let's mark it as 'in_progress' if we had that status, otherwise just keep it.
        // For now, we assume 'confirmed' is fine, or we can add a log.

        revalidatePath(`/staff/${requestId}`);
        return { success: true, data: log };

    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function finishJob(logId: string, requestId: string, evidence: string[]): Promise<ActionResponse> {
    try {
        const supabase = await createClient();

        // 1. Update Log
        const { error: logError } = await supabase
            .from('service_logs')
            .update({
                ended_at: new Date().toISOString(),
                end_photos: evidence,
                status: 'completed' // if log has status
            })
            .eq('id', logId);

        if (logError) return { success: false, error: "Error al finalizar el log" };

        // 2. Mark Request as Completed
        const { error: reqError } = await supabase
            .from('service_requests')
            .update({ status: 'completed' })
            .eq('id', requestId);

        if (reqError) return { success: false, error: "Error al actualizar la solicitud" };

        revalidatePath('/admin');
        revalidatePath('/dashboard');
        return { success: true };

    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function getJobDetails(requestId: string) {
    const supabase = await createClient();

    const { data: request } = await supabase
        .from('service_requests')
        .select(`
            *,
            properties (
                title,
                address
            )
        `)
        .eq('id', requestId)
        .single();

    return request;
}
