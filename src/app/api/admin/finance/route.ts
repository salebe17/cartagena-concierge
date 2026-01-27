import { createClient, createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// Helper to manually aggregate finance stats
export async function GET() {
    try {
        // Use standard client.
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const dbClient = await createAdminClient();
        const { data: profile } = await dbClient.from('profiles').select('role').eq('id', user.id).single();

        if (profile?.role !== 'admin') {
            return NextResponse.json({ success: false, error: "Forbidden: Admin only" }, { status: 403 });
        }

        // 1. Scalable Stats via RPC (O(1) Memory usage in API)
        const { data: statsData, error: rpcError } = await dbClient.rpc('get_finance_stats');

        if (rpcError) throw rpcError;

        // Ensure defaults if empty
        const stats = {
            total: statsData.total || 0,
            byService: {
                cleaning: 0,
                maintenance: 0,
                concierge: 0,
                other: 0,
                ...statsData.byService
            },
            propertyRevenue: statsData.propertyRevenue || []
        };

        return NextResponse.json({
            success: true,
            data: {
                stats,
                propertyRevenue: stats.propertyRevenue
            }
        });

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        console.error("API Finance Error:", error);
        return NextResponse.json(
            { success: false, error: errorMessage },
            { status: 500 }
        );
    }
}
