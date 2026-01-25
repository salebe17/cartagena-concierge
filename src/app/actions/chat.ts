'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { ActionResponse } from '@/lib/types';
import { deepSerialize } from '@/lib/utils/serialization';


export async function sendMessage(content: string, requestId?: string, receiverId?: string): Promise<ActionResponse> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");
        // Ensure inputs are strings
        const safeContent = String(content || "");
        const safeRequestId = requestId ? String(requestId) : null;
        const safeReceiverId = receiverId ? String(receiverId) : null;

        const { error } = await supabase
            .from('messages')
            .insert({
                content: safeContent,
                sender_id: user.id,
                receiver_id: safeReceiverId,
                service_request_id: safeRequestId
            });

        if (error) throw error;
        return { success: true };
    } catch (e: any) {
        console.error("SendMessage Error:", e);
        return { success: false, error: e.message };
    }
}

export async function getConversation(requestId?: string, userId?: string): Promise<any[]> {
    try {
        const supabase = await createClient();

        let query = supabase
            .from('messages')
            .select(`
                *,
                profiles!sender_id (
                   full_name,
                   role,
                   avatar_url
                )
            `)
            .order('created_at', { ascending: true });

        if (requestId) {
            query = query.eq('service_request_id', requestId);
        } else if (userId) {
            // General support for a specific user
            query = query.or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);
        }

        const { data, error } = await query;
        if (error) throw error;
        return deepSerialize(data || []);
    } catch (e) {
        console.error("GetConversation Error:", e);
        return [];
    }
}

export async function getAdminInbox(): Promise<any[]> {
    try {
        const adminSupabase = await createAdminClient();

        // Get unique conversations based on service_request_id or sender_id (if no request)
        // This is a simplified group-by logic for the demo
        const { data: messages, error } = await adminSupabase
            .from('messages')
            .select(`
                *,
                profiles!sender_id (
                    full_name,
                    email
                ),
                service_requests (
                    service_type,
                    properties (title)
                )
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Group by requestId or senderId
        const conversations: Record<string, any> = {};
        messages?.forEach(msg => {
            const key = msg.service_request_id || msg.sender_id;
            // The person the Admin is chatting with is the non-admin participant
            const chatPartnerId = msg.profiles?.role !== 'admin' ? msg.sender_id : msg.receiver_id;

            if (!conversations[key]) {
                conversations[key] = {
                    id: key,
                    chatPartnerId: chatPartnerId,
                    isRequest: !!msg.service_request_id,
                    lastMessage: msg.content,
                    timestamp: msg.created_at,
                    senderName: msg.profiles?.full_name || 'Desconocido',
                    propertyTitle: msg.service_requests?.properties?.title || 'Consulta General',
                    serviceType: msg.service_requests?.service_type || 'Soporte',
                    unread: !msg.is_read && msg.profiles?.role !== 'admin'
                };
            }
        });

        return deepSerialize(Object.values(conversations));
    } catch (e) {
        console.error("GetAdminInbox Error:", e);
        return [];
    }
}

export async function markAsRead(ids: string[]): Promise<ActionResponse> {
    try {
        const adminSupabase = await createAdminClient();
        const { error } = await adminSupabase
            .from('messages')
            .update({ is_read: true })
            .in('id', ids);

        if (error) throw error;
        return { success: true };
    } catch (e) {
        return { success: false, error: "Error marking as read" };
    }
}
