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
    // 1. Auth & Role Check (WRAPPED FOR DEBUGGING)
    let user = null;
    let profile = null;

    try {
        const supabase = await createClient();
        const authResponse = await supabase.auth.getUser();
        user = authResponse.data.user;

        if (user) {
            const profileResponse = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();
            profile = profileResponse.data;
        }
    } catch (error: any) {
        console.error("Supabase Initialization Error:", error);
        return (
            <div className="p-10 text-red-600">
                <h1 className="font-bold text-2xl">CRITICAL AUTH ERROR</h1>
                <p>Could not initialize database connection.</p>
                <div className="bg-gray-100 p-4 mt-4 rounded text-xs text-black overflow-auto whitespace-pre-wrap">
                    {JSON.stringify(error, Object.getOwnPropertyNames(error), 2)}
                    {String(error)}
                </div>
            </div>
        );
    }

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
