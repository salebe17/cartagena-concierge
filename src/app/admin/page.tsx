import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AdminDashboardView } from '@/components/AdminDashboardView';
import { getAllServiceRequests, getAllBookings } from '@/app/actions/admin';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
    const supabase = await createClient();

    // 1. Auth & Role Check
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
        redirect('/dashboard'); // Only admins allowed
        return null;
    }

    // 2. Fetch Global Data (Sequential & Safe)
    let requests: any[] = [];
    let bookings: any[] = [];

    // Safely Fetch Requests
    try {
        requests = await getAllServiceRequests();
    } catch (err) {
        console.error("Failed to fetch requests:", err);
    }

    // Safely Fetch Bookings
    try {
        bookings = await getAllBookings();
    } catch (err) {
        console.error("Failed to fetch bookings:", err);
    }

    // 3. Render View
    return (
        <AdminDashboardView requests={requests} bookings={bookings} />
    );
}
