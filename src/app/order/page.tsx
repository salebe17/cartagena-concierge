import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import { OrderForm } from "@/components/order-form"
import { LogoutButton } from "@/components/logout-button"

export default async function OrderPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return redirect('/login')

    // Fetch Profile Status
    const { data: profile } = await supabase
        .from('profiles')
        .select('kyc_status')
        .eq('id', user.id)
        .single()

    // 🛑 THE SECURITY WALL 🛑
    // If no status or 'unverified', KICK them to verify page
    if (!profile?.kyc_status || profile.kyc_status === 'unverified') {
        redirect('/verify')
    }

    // If 'pending', show Waiting Room (Do not allow ordering)
    if (profile.kyc_status === 'pending') {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-black text-white">
                <h1 className="text-2xl font-bold mb-4">⏳ Verificación en Proceso</h1>
                <p>Tus documentos están siendo revisados por nuestro equipo.</p>
                <p className="mt-2 text-sm text-gray-400">Te notificaremos cuando puedas pedir.</p>
                <div className="mt-6">
                    <LogoutButton />
                </div>
            </div>
        )
    }

    // If 'rejected', show Error
    if (profile.kyc_status === 'rejected') {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-black text-white">
                <h1 className="text-2xl font-bold mb-4 text-red-500">❌ Tu solicitud fue rechazada</h1>
                <p>Contacta soporte para más información.</p>
                <div className="mt-6">
                    <LogoutButton />
                </div>
            </div>
        )
    }

    // If 'verified', render the normal Order Form...
    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8 dark:bg-black">
            <div className="max-w-md mx-auto">
                <div className="flex items-center gap-2 mb-6">
                    <Link href="/dashboard">
                        <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-emerald-400">Solicitar Efectivo</h1>
                </div>

                <OrderForm />
            </div>
        </div>
    )
}
