import { createClient, createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// Helper to manually aggregate finance stats
export async function GET() {
    try {
        console.log("API: Fetching Finance Stats...");
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

        // 1. Fetch Invoices (Paid) with Service Requests relation
        // We use dbClient (Admin) to ensure we see all invoices
        const { data: invoices, error: invError } = await dbClient
            .from('invoices')
            .select('*')
            .eq('status', 'paid');

        if (invError) throw invError;

        // 2. Fetch Service Requests for these invoices (for service_type)
        // and Properties (for revenue by property)

        // Get related Service request IDs
        const requestIds = invoices.map(i => i.service_request_id).filter(id => id);

        let requestsMap = new Map(); // id -> { service_type, property_id }

        if (requestIds.length > 0) {
            const { data: requests } = await dbClient
                .from('service_requests')
                .select('id, service_type, property_id')
                .in('id', requestIds);

            requests?.forEach(r => requestsMap.set(r.id, r));
        }

        // 3. Retrieve Property Info
        // Collect property IDs from the requests
        const propertyIds = new Set<string>();
        requestsMap.forEach((r: any) => {
            if (r.property_id) propertyIds.add(r.property_id);
        });

        let propsMap = new Map(); // id -> title
        if (propertyIds.size > 0) {
            const { data: props } = await dbClient
                .from('properties')
                .select('id, title')
                .in('id', Array.from(propertyIds));
            props?.forEach((p: any) => propsMap.set(p.id, p.title));
        }

        // 4. Aggregate Stats
        const stats = {
            total: 0,
            byService: {
                cleaning: 0,
                maintenance: 0,
                concierge: 0,
                other: 0
            } as Record<string, number>
        };

        const propertyRevenueMap = new Map<string, { title: string, revenue: number }>();

        // Init property map for known properties (so we show even those with 0 revenue?? No, usually only positive)
        // Logic in admin.ts only showed positive revenue.

        invoices.forEach((inv: any) => {
            const amount = inv.amount || 0;
            stats.total += amount;

            const req = requestsMap.get(inv.service_request_id);
            const type = req?.service_type || 'other';

            // Service breakdown
            if (type in stats.byService) {
                stats.byService[type] += amount;
            } else {
                stats.byService.other += amount;
            }

            // Property breakdown
            if (req?.property_id) {
                const propId = req.property_id;
                const propTitle = propsMap.get(propId) || 'Unknown Property';

                if (!propertyRevenueMap.has(propId)) {
                    propertyRevenueMap.set(propId, { title: propTitle, revenue: 0 });
                }

                const entry = propertyRevenueMap.get(propId)!;
                entry.revenue += amount;
            }
        });

        // 5. Format Property Revenue List
        const propertyRevenue = Array.from(propertyRevenueMap.entries())
            .map(([id, data]: [string, any]) => ({ id, ...data }))
            .sort((a: any, b: any) => b.revenue - a.revenue);

        return NextResponse.json({
            success: true,
            data: {
                stats,
                propertyRevenue
            }
        });

    } catch (error: any) {
        console.error("API Finance Error:", error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
