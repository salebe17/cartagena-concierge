import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { OrderForm } from '@/components/order-form';
import { LogoutButton } from '@/components/logout-button';
import { KYCBanner } from '@/components/kyc-banner';

export default async function DashboardPage() {
    const supabase = await createClient();

    // 1. Auth Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    // 2. Profile Check
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    const status = profile?.kyc_status || 'unverified';

    // 🛑 Security Gates
    if (status === 'unverified') redirect('/verify');

    if (status === 'pending') {
        return (
            <div className="flex flex-col h-screen items-center justify-center bg-gray-950 text-white p-4 text-center">
                <h1 className="text-3xl font-bold mb-4 text-yellow-500">⏳ Verificación en Proceso</h1>
                <p className="mb-6 text-gray-400">Tus documentos están siendo revisados.</p>
                <LogoutButton />
            </div>
        );
    }

    if (status === 'rejected') {
        return <div className="p-10 text-white">❌ Tu solicitud fue rechazada.</div>;
    }

    // ✅ Dashboard for Verified Users
    return (
        <div className="min-h-screen bg-black text-white p-4">
            <header className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
                <div>
                    <h1 className="text-xl font-bold tracking-tighter">Cartagena Concierge</h1>
                    <p className="text-xs text-gray-500">Hola, {profile.full_name?.split(' ')[0] || 'Usuario'}</p>
                </div>
                <div className="transform scale-90 origin-right">
                    <LogoutButton />
                </div>
            </header>

            <main className="max-w-md mx-auto pb-20">
                <div className="mb-6">
                    <KYCBanner status={status} />
                </div>

                <OrderForm />
            </main>
        </div>
    );
}
