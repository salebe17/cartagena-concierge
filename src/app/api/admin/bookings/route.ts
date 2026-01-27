import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const supabase = await createClient();

        // Fetch Bookings with profiles via user_id
        // user_id references auth.users, and profiles.id references auth.users
        // Supabase/PostgREST can usually infer this if we join on public.profiles!user_id or similar
        // Try selecting profiles via the user_id FK if it detects it, otherwise we might need a direct FK or explicit join hints

        // Actually, bookings(user_id) -> auth.users. profiles(id) -> auth.users.
        // It might NOT automate this join directly if there isn't a direct FK from bookings to profiles.
        // Let's check if we can query public.profiles referencing user_id?
        // Note: PostgREST doesn't join across schemas (auth vs public) easily for embedding.
        // If bookings.user_id references auth.users, and profiles is in public...
        // We probably need to rely on the fact that profiles.id = bookings.user_id. 
        // But without a FK constraint from bookings.user_id -> public.profiles.id, embedding won't work automatically.

        // SAFE BET: Just fetch bookings first, then fetch profiles manually to avoid 500 if relationship is missing.
        // OR better: define the relationship or check if one exists.
        // Given I'm in "Stability Lockdown", I'll do the manual fetch (Two-step) to be 100% sure it works without schema changes.

        const { data: bookingsData, error: bookingsError } = await supabase
            .from('bookings')
            .select('*')
            .order('created_at', { ascending: false });

        if (bookingsError) throw bookingsError;

        // Manual Join for Safety
        const safeBookings = bookingsData || [];
        const userIds = safeBookings.map((b: any) => b.user_id).filter((id: any) => id);
        let bookingsWithProfiles = safeBookings;

        if (userIds.length > 0) {
            const { data: profiles } = await supabase
                .from('profiles')
                .select('id, full_name, email, phone') // 'phone' based on schema, not 'phone_number'
                .in('id', userIds);

            const profileMap = new Map(profiles?.map((p: any) => [p.id, p]) || []);

            bookingsWithProfiles = safeBookings.map((b: any) => ({
                ...b,
                profiles: profileMap.get(b.user_id) || null
            }));
        }

        return NextResponse.json({ success: true, data: bookingsWithProfiles });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
