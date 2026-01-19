import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import { OrderForm } from "@/components/order-form"
import { KYCBanner } from "@/components/kyc-banner"

export default async function OrderPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('kyc_status')
        .eq('id', user.id)
        .single()

    const status = profile?.kyc_status || 'unverified'
    const isVerified = status === 'verified'

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

                {/* KYC Banner at the top */}
                <KYCBanner status={status} />

                {/* Order Form - Only visible if verified */}
                {isVerified ? (
                    <OrderForm />
                ) : (
                    <div className="text-center p-8 bg-zinc-900/50 rounded-lg border border-zinc-800 text-zinc-500">
                        <p>Formulario de pedido deshabilitado hasta completar verificación.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
