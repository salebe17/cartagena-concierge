import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const supabase = await createClient();

        // Fetch Requests with profiles manually to avoid Relationship Errors
        const { data: requestsData, error: reqError } = await supabase
            .from('service_requests')
            .select('*')
            .is('deleted_at', null)
            .order('created_at', { ascending: false })
            .limit(100); // Level 28: Prevent Timebomb

        if (reqError) throw reqError;

        // Manual Join
        // Requests usually link via property_id -> owner_id? Or do they have a direct user_id?
        // Schema says: property_id references properties. Nothing about user_id directly on service_requests.
        // But properties has owner_id.
        // So we need to fetch properties to get owner_id, then profiles.

        // Check `service_requests` columns in schema...
        // 107: matches property_id
        // 112: matches assigned_staff_id
        // It does NOT have client_id in the create definition in production_schema.sql lines 105-114.
        // WAIT. My failing query tried `profiles:client_id`.
        // If `client_id` doesn't exist, that's why it would fail.

        // Let's verify if `client_id` exists in `sprint3_schema_updates.sql`?
        // If not, I can only link via property -> owner.

        const propertyIds = requestsData.map(r => r.property_id).filter(id => id);
        let enrichedRequests = requestsData;

        if (propertyIds.length > 0) {
            // Get properties and their owners
            const { data: properties } = await supabase
                .from('properties')
                .select('id, title, address, owner_id')
                .in('id', propertyIds);

            const propMap = new Map(properties?.map(p => [p.id, p]) || []);
            const ownerIds = properties?.map(p => p.owner_id).filter(id => id) || [];

            // Get profiles of owners
            const { data: profiles } = await supabase
                .from('profiles')
                .select('id, full_name, email, phone')
                .in('id', ownerIds);
            const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

            enrichedRequests = requestsData.map((r: any) => {
                const prop = propMap.get(r.property_id);
                const profile = prop ? profileMap.get((prop as any).owner_id) : null;
                return {
                    ...r,
                    properties: prop,
                    profiles: profile
                };
            });
        }

        return NextResponse.json({ success: true, data: enrichedRequests });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
