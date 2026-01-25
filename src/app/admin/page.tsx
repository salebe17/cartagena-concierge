import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AdminDashboardView } from '@/components/AdminDashboardView';
import { getAllServiceRequests, getAllBookings } from '@/app/actions/admin';
import { deepSerialize } from '@/lib/utils/serialization';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
    try {
        const supabase = await createClient();

        // 1. Auth & Role Check (MUST be outside inner try-catch to allow redirect() to work)
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
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
        // Re-throw Next.js redirects so they work
        if (error.message === 'NEXT_REDIRECT') {
            throw error;
        }
        if (error?.digest?.startsWith('NEXT_REDIRECT')) {
            throw error;
        }

        console.error("Admin Page Master Crash:", error);
        return (
            <div className="p-10 flex flex-col items-center justify-center min-h-screen text-center bg-gray-50">
                <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-xl max-w-lg">
                    <h1 className="text-gray-900 font-black text-2xl mb-2">Panel No Disponible</h1>
                    <p className="text-gray-500 mb-6">El sistema de administración está reiniciando sus servicios.</p>
                    <div className="bg-gray-100 p-4 rounded-xl text-left text-[10px] text-gray-500 font-mono overflow-auto max-h-40">
                        {error.message || "Error desconocido"}
                    </div>
                    <a href="/admin" className="mt-6 inline-block px-6 py-3 bg-gray-900 text-white rounded-xl text-sm font-bold shadow-lg shadow-gray-200 hover:scale-105 transition-transform">
                        Recargar Sistema
                    </a>
                </div>
            </div>
        );
    }
}
