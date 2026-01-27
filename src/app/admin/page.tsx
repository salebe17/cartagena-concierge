import { AdminDashboardView } from '@/components/AdminDashboardView';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getAllServiceRequests, getAllBookings } from '@/app/actions/admin';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
    // 1. Fetch Admin Data Server-Side
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Parallel fetch for speed
    const [requests, bookings] = await Promise.all([
        getAllServiceRequests(),
        getAllBookings()
    ]);

    return (
        <AdminDashboardView
            requests={requests}
            bookings={bookings}
        />
    );
}
