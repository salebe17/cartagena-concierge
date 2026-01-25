import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const supabase = await createClient();

        // Fetch Messages with sender profile and service_request info
        // Standard client usually respects RLS (Admins can see all)
        const { data: messages, error } = await supabase
            .from('messages')
            .select(`
                *,
                profiles!sender_id (
                    full_name,
                    email,
                    role
                ),
                service_requests (
                    service_type,
                    properties (title)
                )
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Grouping Logic (Same as original action)
        const conversations: Record<string, any> = {};
        messages?.forEach(msg => {
            const key = msg.service_request_id || msg.sender_id;
            // The person the Admin is chatting with is the non-admin participant
            // If sender is admin, then we need receiver... but msg.profiles!sender_id.role
            // Wait, msg.profiles is array or object? It's object thanks to !sender_id

            // Note: Typescript might cry about profiles array vs object.
            // PostgREST single relation returns object.

            const senderRole = (msg.profiles as any)?.role;
            const chatPartnerId = senderRole !== 'admin' ? msg.sender_id : msg.receiver_id;

            if (!conversations[key]) {
                const props = (msg.service_requests as any)?.properties;
                conversations[key] = {
                    id: key,
                    chatPartnerId: chatPartnerId,
                    isRequest: !!msg.service_request_id,
                    lastMessage: msg.content,
                    timestamp: msg.created_at,
                    senderName: (msg.profiles as any)?.full_name || 'Desconocido',
                    propertyTitle: props?.title || 'Consulta General',
                    serviceType: (msg.service_requests as any)?.service_type || 'Soporte',
                    unread: !msg.is_read && senderRole !== 'admin'
                };
            }
        });

        return NextResponse.json({ success: true, data: Object.values(conversations) });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
