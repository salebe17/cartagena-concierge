import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// Helper to manually aggregate finance stats
export async function GET() {
    try {
        console.log("API: Fetching Finance Stats...");
        // Use standard client. If RLS blocks invoices, we might need a service role client, 
        // but for now let's assume the user is an admin and RLS allows it (Policy: "Admins can manage all invoices").
        // If createClient relies on cookies, it should work for the logged-in admin.
        const supabase = await createClient();

        // 1. Fetch Invoices (Paid) with Service Requests relation
        // We do manual join to be safe from "missing relationship" errors
        const { data: invoices, error: invError } = await supabase
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
            const { data: requests } = await supabase
                .from('service_requests')
                .select('id, service_type, property_id')
                .in('id', requestIds);

            requests?.forEach(r => requestsMap.set(r.id, r));
        }

        // 3. Retrieve Property Info
        // Collect property IDs from the requests
        const propertyIds = new Set<string>();
        requestsMap.forEach(r => {
            if (r.property_id) propertyIds.add(r.property_id);
        });

        let propsMap = new Map(); // id -> title
        if (propertyIds.size > 0) {
            const { data: props } = await supabase
                .from('properties')
                .select('id, title')
                .in('id', Array.from(propertyIds));
            props?.forEach(p => propsMap.set(p.id, p.title));
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

        invoices.forEach(inv => {
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
            .map(([id, data]) => ({ id, ...data }))
            .sort((a, b) => b.revenue - a.revenue);

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
