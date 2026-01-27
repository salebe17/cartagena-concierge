import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

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

        if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

        // 1. Ownership Check
        const { data: property } = await supabase
            .from('properties')
            .select('owner_id')
            .eq('id', propertyId)
            .single();

        if (!property || property.owner_id !== user.id) {
            return NextResponse.json({ success: false, error: "Unauthorized property access" }, { status: 403 });
        }

        // 2. Duplicate Check
        const reqDate = new Date(date);
        const startOfDay = new Date(reqDate.getFullYear(), reqDate.getMonth(), reqDate.getDate()).toISOString();
        const endOfDay = new Date(reqDate.getFullYear(), reqDate.getMonth(), reqDate.getDate(), 23, 59, 59).toISOString();

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
            notes: notes,
            requested_date: new Date(date).toISOString(),
            status: 'pending'
        });

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
