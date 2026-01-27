import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        const myId = user?.id;

        // Fetch Messages with sender and receiver profile
        const { data: messages, error } = await supabase
            .from('messages')
            .select(`
                *,
                sender:profiles!sender_id (
                    full_name,
                    email,
                    role
                ),
                receiver:profiles!receiver_id (
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

        // Grouping Logic
        const conversations: Record<string, any> = {};

        messages?.forEach((msg: any) => {
            const sender = msg.sender as any;
            const receiver = msg.receiver as any;

            const isMe = myId && msg.sender_id === myId;
            let partnerId = null;
            let partnerProfile: any = null;

            if (isMe) {
                partnerId = msg.receiver_id;
                partnerProfile = receiver;
            } else {
                partnerId = msg.sender_id;
                partnerProfile = sender;
            }

            // Group Key precedence: Service Request > Direct Partner
            const key = msg.service_request_id || partnerId;

            if (!key) return;

            if (!conversations[key]) {
                const props = (msg.service_requests as any)?.properties;
                conversations[key] = {
                    id: key, // This is either requestID or PartnerID
                    chatPartnerId: partnerId,
                    isRequest: !!msg.service_request_id,
                    lastMessage: msg.content,
                    timestamp: msg.created_at,
                    // The Display Name of the thread is always the Partner's name
                    senderName: partnerProfile?.full_name || 'Usuario',
                    email: partnerProfile?.email,
                    propertyTitle: props?.title || 'Mensaje Directo',
                    serviceType: (msg.service_requests as any)?.service_type || 'Soporte',
                    // Unread if the LAST message was sent BY the partner (not me) AND is not read
                    unread: !msg.is_read && msg.sender_id === partnerId
                };
            }
        });

        return NextResponse.json({ success: true, data: Object.values(conversations) });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
