import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { sanitizeInput } from '@/lib/utils';

export const runtime = 'nodejs';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const propertyId = formData.get('propertyId') as string;
        const serviceType = formData.get('serviceType') as string;
        const date = formData.get('date') as string;
        const notes = formData.get('notes') as string;

        if (!propertyId || !serviceType || !date) {
            return NextResponse.json({ success: false, error: "Missing fields" }, { status: 400 });
        }

        if (notes && notes.length > 500) {
            return NextResponse.json({ success: false, error: "Las notas no pueden exceder 500 caracteres." }, { status: 400 });
        }

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        import { sanitizeInput } from '@/lib/utils';

        // ...

        if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

        // LEVEL 11: Rate Limit Check (5 requests per minute per user)
        const rateLimitKey = `req_create_${user.id}`;
        const { data: allowed, error: rlError } = await supabase.rpc('check_rate_limit', {
            p_key_prefix: rateLimitKey,
            p_limit: 5,
            p_window_seconds: 60
        });

        if (rlError) {
            console.error("Rate Limit RPC Error:", rlError);
            // Fail open or closed? Closed for stress test.
        }

        if (allowed === false) {
            return NextResponse.json({ success: false, error: 'Has excedido el límite de solicitudes. Por favor espera un minuto.' }, { status: 429 });
        }

        // LEVEL 11: Input Sanitization
        const cleanNotes = sanitizeInput(notes);

        // 1. Ownership Check
        const { data: property } = await supabase
            .from('properties')
            .select('owner_id')
            .eq('id', propertyId)
            .single();

        if (!property || property.owner_id !== user.id) {
            return NextResponse.json({ success: false, error: "Unauthorized property access" }, { status: 403 });
        }

        // 2. Date Validation (Colombia Timezone UTC-5)
        const reqDate = new Date(date);

        // Current time in Colombia
        const now = new Date();
        const colombiaOffset = -5 * 60;
        const localNow = new Date(now.getTime() + (colombiaOffset * 60 * 1000));
        localNow.setUTCHours(0, 0, 0, 0);

        const reqLocal = new Date(reqDate.getTime());
        reqLocal.setUTCHours(0, 0, 0, 0);

        if (reqLocal < localNow) {
            return NextResponse.json({ success: false, error: "No puedes solicitar servicios para fechas pasadas." }, { status: 400 });
        }

        // 2.5 Duplicate Check
        const startOfDay = new Date(reqDate);
        startOfDay.setUTCHours(0, 0, 0, 0);
        const endOfDay = new Date(reqDate);
        endOfDay.setUTCHours(23, 59, 59, 999);

        const { data: existing } = await supabase
            .from('service_requests')
            .select('id')
            .eq('property_id', propertyId)
            .eq('service_type', serviceType)
            .neq('status', 'cancelled')
            .gte('requested_date', startOfDay)
            .lte('requested_date', endOfDay)
            .maybeSingle();

        if (existing) {
            return NextResponse.json({ success: false, error: "Duplicate request for this date" }, { status: 409 });
        }

        // 3. Insert
        const { error } = await supabase.from('service_requests').insert({
            property_id: propertyId,
            service_type: serviceType,
            notes: cleanNotes,
            requested_date: new Date(date).toISOString(),
            status: 'pending'
        });

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
