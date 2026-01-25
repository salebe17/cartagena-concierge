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
