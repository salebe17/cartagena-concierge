import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { deepSerialize } from '@/lib/utils/serialization';

export const runtime = 'nodejs';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const title = formData.get('title') as string;
        const address = formData.get('address') as string;
        const ical_url = formData.get('ical_url') as string;
        const image_url = formData.get('image_url') as string;
        const bedrooms = parseInt(formData.get('bedrooms') as string || '0');

        if (!title || !address) {
            return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
        }

        if (title.length > 100 || address.length > 200) {
            return NextResponse.json({ success: false, error: "Título (100) o Dirección (200) exceden el límite." }, { status: 400 });
        }

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

        const { error } = await supabase.from('properties').insert({
            owner_id: user.id,
            title,
            address,
            ical_url: ical_url || null,
            image_url: image_url || null,
            bedrooms: bedrooms || null,
            status: 'vacant'
        });

        if (error) throw error;

        return NextResponse.json({ success: true, message: "Property registered" });
    } catch (e: any) {
        console.error("Register Property Error:", e);
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
