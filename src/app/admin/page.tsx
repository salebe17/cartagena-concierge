import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AdminDashboardView } from '@/components/AdminDashboardView';
import { getAllServiceRequests, getAllBookings } from '@/app/actions/admin';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
    // PHASE 1: UI RESTORATION TEST
    // We render the full view but with GUARANTEED empty data.
    // This tests if the COMPONENT renders client-side without crashing.

    // We still check auth to be safe/realistic
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
        return null;
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'admin') {
        redirect('/dashboard');
        return null;
    }

    // HARDCODED EMPTY DATA for Phase 1
    const requests: any[] = [];
    const bookings: any[] = [];

    // TEST: Logic worked, now render simple HTML to see if Component Import is the killer.
    return (
        <div className="p-10">
            <h1 className="text-green-600 font-bold text-2xl">LOGIC CHECK PASSED</h1>
            <p className="text-gray-600">User: {user.email}</p>
            <p>Role: {profile?.role}</p>
            <p>If you see this, Supabase Auth is fine. The problem IS the AdminDashboardView Import.</p>
        </div>
    );
    /*
    return (
        <AdminDashboardView requests={requests} bookings={bookings} />
    );
    */
}
