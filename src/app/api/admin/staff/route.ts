import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // 1. Init Supabase (Standard Server Client)
        const supabase = await createClient();

        // 2. Fetch Staff
        const { data: staff, error: staffError } = await supabase
            .from('staff_members')
            .select('*')
            .order('full_name', { ascending: true });

        if (staffError) throw staffError;

        // 3. Return Plain JSON
        return NextResponse.json({
            success: true,
            data: staff,
            timestamp: new Date().toISOString()
        });

    } catch (error: any) {
        console.error("API Staff Error:", error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const body = await request.json();

        // Basic Validation
        if (!body.full_name) {
            return NextResponse.json({ success: false, error: "Missing name" }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('staff_members')
            .insert([body])
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const supabase = await createClient();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ success: false, error: "Missing ID" }, { status: 400 });

        const { error } = await supabase
            .from('staff_members')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
