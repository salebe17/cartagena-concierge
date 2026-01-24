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
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-lg w-full text-center border border-red-100">
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" /></svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Diagnóstico de Variables</h2>
                    <p className="text-sm text-gray-500 mb-4">
                        Revisa si accidentalmente pegaste comillas o espacios en Vercel.
                    </p>

                    <div className="text-left space-y-2 mb-6 text-xs font-mono">
                        <div className="bg-gray-100 p-2 rounded">
                            <p className="font-bold text-gray-500">URL Recibida (Entre corchetes):</p>
                            <p className="break-all text-blue-600">[{url}]</p>
                            <p className="text-gray-400 mt-1">Longitud: {url?.length || 0} caracteres</p>
                        </div>
                        <div className="bg-gray-100 p-2 rounded">
                            <p className="font-bold text-gray-500">Anon Key Recibida:</p>
                            <p className="break-all text-blue-600">[{key?.substring(0, 10)}...]</p>
                        </div>
                        <div className="bg-red-50 p-2 rounded border border-red-100">
                            <p className="font-bold text-red-500">Error Real:</p>
                            <p className="text-red-700">{String(error.message || error)}</p>
                        </div>
                    </div>

                    <a href="https://vercel.com/dashboard" target="_blank" className="block w-full py-2 bg-black text-white rounded font-bold hover:bg-gray-800">
                        Ir a Vercel Environment Variables
                    </a>
                </div>
            </div>
        );
    }
}
