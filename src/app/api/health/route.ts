import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const start = Date.now();
        const supabase = await createClient();

        // Deep Check: Actually query the DB
        const { data, error } = await supabase.from('system_settings').select('count').limit(1).single();

        const latency = Date.now() - start;

        if (error) {
            throw error;
        }

        return NextResponse.json({
            status: 'healthy',
            latency: `${latency}ms`,
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV
        });
    } catch (e: any) {
        return NextResponse.json({
            status: 'unhealthy',
            error: e.message
        }, { status: 503 });
    }
}
