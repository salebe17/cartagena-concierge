import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardUI from '@/components/dashboard-ui'

import { LogoutButton } from '@/components/logout-button'

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return redirect('/login')

    // Check KYC Status
    const { data: profile } = await supabase
        .from('profiles')
        .select('kyc_status')
        .eq('id', user.id)
        .single()

    const status = profile?.kyc_status || 'unverified'

    // 🛑 LOGIC GATES 🛑

    // CASE A: Unverified -> KICK to /verify immediately
    if (status === 'unverified') {
        redirect('/verify')
    }

    // CASE B: Pending -> Show "Waiting Room"
    if (status === 'pending') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white p-6 text-center">
                <div className="text-6xl mb-4">⏳</div>
                <h1 className="text-3xl font-bold mb-2 text-yellow-500">Verificación en Proceso</h1>
                <p className="text-gray-300 max-w-md mb-6">
                    Hemos recibido tus documentos. Estamos validando tu identidad.
                    Te notificaremos cuando tu cuenta esté activa para pedir.
                </p>
                <div className="p-4 bg-gray-900 rounded-lg border border-gray-700">
                    <p className="text-sm text-gray-500">Estado actual: <span className="text-blue-400 font-mono">PENDING_REVIEW</span></p>
                </div>
                <div className="mt-8">
                    <LogoutButton />
                </div>
            </div>
        )
    }

    // CASE C: Rejected -> Show Error
    if (status === 'rejected') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-red-950 text-white p-6">
                <h1 className="text-3xl font-bold">❌ Solicitud Rechazada</h1>
                <p className="mt-2">Hubo un problema con tus documentos.</p>
                <div className="mt-4 flex flex-col items-center gap-4">
                    <a href="/verify" className="bg-white text-red-900 px-4 py-2 rounded font-bold hover:bg-zinc-200">Intentar de nuevo</a>
                    <LogoutButton />
                </div>
            </div>
        )
    }

    // CASE D: Verified -> Render the Dashboard normally
    const { data: order } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

    return <DashboardUI user={user} order={order} />
}
