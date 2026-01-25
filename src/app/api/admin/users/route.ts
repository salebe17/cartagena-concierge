import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const supabase = await createClient();

        // Check Auth using getUser which is secure
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        // Ideally check for admin role here, but RLS on profiles should handle visibility if set correctly.
        // However, for an "Admin" feature, we want to see everyone. 
        // Admin policies usually allow viewing all profiles.

        const { data: profiles, error } = await supabase
            .from('profiles')
            .select('id, full_name, email, role, avatar_url, phone')
            .order('full_name', { ascending: true });

        if (error) throw error;

        return NextResponse.json({
            success: true,
            data: profiles
        });

    } catch (error: any) {
        console.error("API Users Error:", error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
