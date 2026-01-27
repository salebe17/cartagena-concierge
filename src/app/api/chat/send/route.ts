import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const json = await request.json();
        const { content, requestId, receiverId, mediaUrl, mediaType } = json;

        // Validation
        if (!content && !mediaUrl) {
            return NextResponse.json({ success: false, error: 'Content or media required' }, { status: 400 });
        }

        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        // Rate Limit Check (20 messages per minute)
        const { data: allowed, error: rlError } = await supabase.rpc('check_rate_limit', {
            p_user_id: user.id,
            p_action_type: 'chat_message',
            p_max_count: 20
        });

        if (rlError) {
            console.error("Rate Limit Error:", rlError);
            // Fail open if RPC fails? Or close? Let's fail close for security, but log.
        }

        if (allowed === false) {
            return NextResponse.json({ success: false, error: 'Demasiados mensajes. Por favor espera un momento.' }, { status: 429 });
        }

        const { error } = await supabase
            .from('messages')
            .insert({
                content: content || '',
                sender_id: user.id,
                receiver_id: receiverId || null,
                service_request_id: requestId || null,
                media_url: mediaUrl || null,
                media_type: mediaType || 'text'
            });

        if (error) {
            console.error("API SendMessage DB Error:", error);
            throw error;
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("API SendMessage Error:", error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
