import { createClient, createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { requestId, staffId } = body;

        if (!requestId || !staffId) {
            return NextResponse.json({ success: false, error: "Missing parameters" }, { status: 400 });
        }

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

        // Admin Check (Optional but recommended)
        const dbClient = await createAdminClient(); // Use admin client to ensure we can write ignoring some RLS if strict

        // 1. Validate Request Status
        const { data: requestRequest } = await dbClient
            .from('service_requests')
            .select('status, requested_date')
            .eq('id', requestId)
            .single();

        if (requestRequest?.status === 'completed' || requestRequest?.status === 'cancelled') {
            return NextResponse.json({ success: false, error: "No se puede asignar personal a una solicitud cerrada." }, { status: 400 });
        }

        // 2. Validate Staff Status
        const { data: staffMember } = await dbClient
            .from('staff_members')
            .select('status')
            .eq('id', staffId)
            .single();

        if (staffMember?.status !== 'active') {
            return NextResponse.json({ success: false, error: "El miembro del staff no está activo." }, { status: 400 });
        }

        // 3. Workload Check (Prevent burnout/impossible schedules)
        if (requestRequest?.requested_date) {
            const reqDate = new Date(requestRequest.requested_date);
            const startDay = new Date(reqDate.getFullYear(), reqDate.getMonth(), reqDate.getDate()).toISOString();
            const endDay = new Date(reqDate.getFullYear(), reqDate.getMonth(), reqDate.getDate(), 23, 59, 59).toISOString();

            const { count } = await dbClient
                .from('service_requests')
                .select('id', { count: 'exact', head: true })
                .eq('assigned_staff_id', staffId)
                .neq('status', 'cancelled')
                .neq('status', 'completed')
                .gte('requested_date', startDay)
                .lte('requested_date', endDay);

            if (count && count >= 3) {
                return NextResponse.json({ success: false, error: "Este empleado ya tiene 3 tareas activas para esa fecha. (Límite diario)" }, { status: 400 });
            }
        }

        const { error } = await dbClient
            .from('service_requests')
            .update({ assigned_staff_id: staffId })
            .eq('id', requestId);

        if (error) {
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
