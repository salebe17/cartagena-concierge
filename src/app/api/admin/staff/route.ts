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
