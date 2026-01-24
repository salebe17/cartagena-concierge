import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AdminDashboardView } from '@/components/AdminDashboardView';
import { getAllServiceRequests, getAllBookings } from '@/app/actions/admin';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
    try {
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
            redirect('/dashboard');
            return null;
        }

        // 2. Fetch Global Data (Sequential & Safe)
        let requests: any[] = [];
        let bookings: any[] = [];

        try { requests = await getAllServiceRequests(); } catch (e) { console.error(e); }
        try { bookings = await getAllBookings(); } catch (e) { console.error(e); }

        // 3. Render View
        return (
            <AdminDashboardView requests={requests} bookings={bookings} />
        );

    } catch (error: any) {
        // Fallback UI for Configuration Errors (prevents 500 Crash)
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-red-100">
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" /></svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Error de Sistema</h2>
                    <p className="text-sm text-gray-500 mb-6">
                        No se pudo conectar con la base de datos. Es probable que falte configuración en el servidor.
                    </p>
                    <div className="bg-gray-100 p-3 rounded text-xs text-left text-gray-700 font-mono overflow-auto max-h-32 mb-4">
                        {String(error.message || error)}
                    </div>
                    <a href="/dashboard" className="text-blue-600 hover:text-blue-800 text-sm font-semibold">
                        &larr; Volver al Dashboard
                    </a>
                </div>
            </div>
        );
    }
}
