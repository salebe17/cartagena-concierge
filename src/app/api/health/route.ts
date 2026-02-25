import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redis } from '@/lib/redis';
import { logger } from '@/lib/logger';

// Master Plan Phase 8: Synthetic Deep Health Checks
// Used by Vercel Checks, Datadog or BetterUptime to verify end-to-end subsystem health

export async function GET() {
    const startTime = performance.now();
    const healthStatus = {
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        services: {
            database: 'unknown',
            redis: 'unknown',
        },
        latency: 0,
        status: 'ok',
    };

    try {
        // 1. Check Database (Supabase / Postgres)
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: { get(name) { return cookieStore.get(name)?.value; } }
            }
        );

        // Lightweight query to verify DB connection pool is active
        const { error: dbError } = await supabase.from('profiles').select('id').limit(1);
        if (dbError) throw new Error(`DB Error: ${dbError.message}`);
        healthStatus.services.database = 'healthy';

        // 2. Check Redis (Upstash)
        if (redis) {
            await redis.ping();
            healthStatus.services.redis = 'healthy';
        } else {
            healthStatus.services.redis = 'disabled';
        }

    } catch (error) {
        healthStatus.status = 'degraded';
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error(`HealthCheck Failed: ${errorMessage}`);

        if (errorMessage.includes('DB Error')) {
            healthStatus.services.database = 'unhealthy';
        } else {
            healthStatus.services.redis = 'unhealthy';
        }

        return NextResponse.json(healthStatus, { status: 503 });
    }

    healthStatus.latency = Math.round(performance.now() - startTime);
    return NextResponse.json(healthStatus, { status: 200 });
}
