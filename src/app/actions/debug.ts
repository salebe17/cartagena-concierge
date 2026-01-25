'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server';
import { deepSerialize } from '@/lib/utils/serialization';

export async function getAdminSystemStatus() {
    const supabase = await createClient();
    const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;

    // 1. Check Auth
    const { data: { user } } = await supabase.auth.getUser();

    // 2. Check Profile via User Client
    let userProfile = null;
    let userProfileError = null;
    if (user) {
        const { data, error } = await supabase
            .from('profiles')
            .select('role, id')
            .eq('id', user.id)
            .single();
        userProfile = data;
        userProfileError = error?.message;
    }

    // 3. Check Row Counts (Service Requests)
    // Try via User Client
    const { count: userCount, error: userError } = await supabase
        .from('service_requests')
        .select('*', { count: 'exact', head: true });

    // 4. TEST FULL FETCH (To see if Joins are breaking it)
    let fullFetchCount = 0;
    let fullFetchError = null;
    try {
        const { data, error } = await supabase
            .from('service_requests')
            .select(`
                *,
                properties (
                    id,
                    title,
                    address,
                    owner_id
                ),
                service_logs (
                    id,
                    started_at,
                    ended_at,
                    staff_name,
                    notes,
                    start_photos,
                    end_photos
                )
            `)
            .order('created_at', { ascending: false });

        if (error) {
            fullFetchError = error.message;
        } else {
            fullFetchCount = data?.length || 0;
        }
    } catch (e: any) {
        fullFetchError = "Exception: " + e.message;
    }

    // Try via Admin Client (if key exists)
    let adminCount = 'N/A';
    let adminError = 'No Key';

    if (hasServiceKey) {
        try {
            const adminClient = await createAdminClient();
            const { count, error } = await adminClient
                .from('service_requests')
                .select('*', { count: 'exact', head: true });
            adminCount = count?.toString() || '0';
            adminError = error?.message || 'None';
        } catch (e: any) {
            adminError = e.message;
        }
    }

    return deepSerialize({
        timestamp: new Date().toISOString(),
        env: {
            hasServiceKey,
            nodeEnv: process.env.NODE_ENV,
        },
        auth: {
            isAuthenticated: !!user,
            userId: user?.id,
            email: user?.email
        },
        profile: {
            data: userProfile,
            error: userProfileError
        },
        dataAccess: {
            viaUserClient: { count: userCount, error: userError?.message },
            fullQueryCheck: { count: fullFetchCount, error: fullFetchError },
            viaAdminClient: { count: adminCount, error: adminError }
        }
    });
}
