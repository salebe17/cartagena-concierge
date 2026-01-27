import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const requestId = searchParams.get('requestId');
        const userId = searchParams.get('userId');

        if (!requestId && !userId) {
            return NextResponse.json({ success: true, data: [] });
        }

        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        let query = supabase
            .from('messages')
            .select(`
                *,
                profile:profiles!sender_id (
                   full_name,
                   role,
                   avatar_url
                )
            `)
            .order('created_at', { ascending: false }) // Get NEWEST first
            .limit(50); // Level 28: Cap at 50 to prevent crash

        if (requestId && requestId !== 'null' && requestId !== 'undefined') {
            query = query.eq('service_request_id', requestId);
        } else if (userId && userId !== 'null' && userId !== 'undefined') {
            // General support for a specific user
            // We need to check if we are pulling a conversation where "userId" is the partner
            // And "me" (user.id) is the other partner.
            // OR if I am admin, I can view any chat involving userId?
            // The previous logic was: query.or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);
            // But this assumes the VIEWER is an Admin who wants to see ALL messages for that user.
            // Or if the VIEWER is the host, they want to see messages where (sender=Me AND receiver=Support) OR (sender=Support AND receiver=Me).

            // To keep it simple and match previous logic:
            query = query.or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);
        } else {
            return NextResponse.json({ success: true, data: [] });
        }

        const { data, error } = await query;

        if (error) {
            console.error("API Chat Query Error:", error);
            throw error;
        }

        return NextResponse.json({
            success: true,
            data: (data || []).reverse() // Reverse back to chronological order
        });

    } catch (error: any) {
        console.error("API GetConversation Error:", error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
