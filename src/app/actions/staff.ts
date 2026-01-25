'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache';
import { ActionResponse } from '@/lib/types';
import { deepSerialize } from '@/lib/utils/serialization';

export async function startJob(requestId: string, staffName: string): Promise<ActionResponse> {
    try {
        const supabase = await createClient();

        // 1. Validate Request exists and get assignment
        const { data: request, error: reqError } = await supabase
            .from('service_requests')
            .select('id, status, assigned_staff_id')
            .eq('id', requestId)
            .single();

        if (reqError || !request) return { success: false, error: "Solicitud no encontrada" };

        // 2. Create Service Log
        const { data: log, error: logError } = await supabase
            .from('service_logs')
            .insert({
                service_request_id: requestId,
                started_at: new Date().toISOString(),
                staff_name: staffName,
                staff_member_id: request.assigned_staff_id, // Link if assigned
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
        return deepSerialize({ success: true, data: log });

    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function saveStartPhotos(logId: string, photos: string[]): Promise<ActionResponse> {
    try {
        const supabase = await createClient();
        const { error } = await supabase
            .from('service_logs')
            .update({ start_photos: photos })
            .eq('id', logId);

        if (error) throw error;
        return deepSerialize({ success: true });
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
        return deepSerialize({ success: true });

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

    return deepSerialize(request);
}

export async function uploadEvidence(formData: FormData): Promise<ActionResponse<{ url: string }>> {
    try {
        const supabase = await createClient();

        const file = formData.get('file') as File;
        const requestId = formData.get('requestId') as string;

        if (!file || !requestId) return { success: false, error: "Archivo o ID faltante" };

        const fileExt = file.name.split('.').pop();
        const fileName = `${requestId}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
            .from('evidence')
            .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
            .from('evidence')
            .getPublicUrl(fileName);

        return { success: true, data: { url: publicUrl } };
    } catch (e: any) {
        return { success: false, error: "Error al subir imagen: " + e.message };
    }
}
