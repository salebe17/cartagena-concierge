import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AdminDashboardView } from '@/components/AdminDashboardView';
import { getAllServiceRequests, getAllBookings } from '@/app/actions/admin';
import { deepSerialize } from '@/lib/utils/serialization';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
    const supabase = await createClient();

    // 1. Auth & Role Check (MUST be outside try-catch to allow redirect() to work)
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'admin') {
        redirect('/dashboard');
    }

    try {
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
            <AdminDashboardView
                requests={deepSerialize(requests) || []}
                bookings={deepSerialize(bookings) || []}
            />
        );
    } catch (error: any) {
        console.error("Admin Page Crash:", error);
        return (
            <div className="p-10 flex flex-col items-center justify-center min-h-screen text-center">
                <div className="bg-red-50 p-6 rounded-xl border border-red-100 max-w-lg">
                    <h1 className="text-red-600 font-bold text-xl mb-2">Error de Carga (Dashboard)</h1>
                    <p className="text-gray-600 mb-4">El sistema encontró un error inesperado al renderizar.</p>
                    <div className="bg-white p-3 rounded text-left text-xs text-red-500 font-mono overflow-auto max-h-40 border border-gray-200">
                        {error.message || JSON.stringify(error)}
                    </div>
                    <p className="text-xs text-gray-400 mt-4">Digest: {error.digest}</p>
                    <a href="/admin" className="mt-4 inline-block px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium">Reintentar</a>
                </div>
            </div>
        );
    }
}
