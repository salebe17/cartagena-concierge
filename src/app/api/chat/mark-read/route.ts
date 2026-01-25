import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const json = await request.json();
        const { ids } = json;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ success: true }); // Nothing to do
        }

        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        // Use admin client if needed, but RLS might allow users to mark their own received messages as read?
        // Actually, usually the receiver marks as read.
        // The policy "Admins can update messages" exists.
        // But what about standard users?
        // Let's assume the user is Admin (since this is Admin Panel).
        // If not, we might need createAdminClient if the user doesn't have RLS permission to update.
        // For now, let's try standard client. If RLS fails, we might need admin.

        const { error } = await supabase
            .from('messages')
            .update({ is_read: true })
            .in('id', ids);

        if (error) {
            console.error("API MarkRead DB Error:", error);
            throw error;
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("API MarkRead Error:", error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
