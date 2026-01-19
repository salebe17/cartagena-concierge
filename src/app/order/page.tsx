import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ShieldAlert, Clock } from "lucide-react"
import { OrderForm } from "@/components/order-form"

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

    // 1. Unverified -> Redirect to Verify
    if (status === 'unverified') {
        return redirect('/verify')
    }

    // 2. Pending -> Full Screen Block
    if (status === 'pending') {
        return (
            <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
                <div className="max-w-md text-center space-y-4">
                    <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                        <Clock className="w-8 h-8 text-yellow-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-zinc-900">Tu cuenta está en revisión</h1>
                    <p className="text-zinc-500">
                        Hemos recibido tus documentos y estamos verificando tu identidad.
                        Este proceso suele tomar unos minutos. Te enviaremos un correo pronto.
                    </p>
                    <Link href="/dashboard">
                        <Button variant="outline">Ir al Dashboard</Button>
                    </Link>
                </div>
            </div>
        )
    }

    // 3. Rejected -> Block with Retry
    if (status === 'rejected') {
        return (
            <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
                <div className="max-w-md text-center space-y-4">
                    <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                        <ShieldAlert className="w-8 h-8 text-red-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-red-900">Verificación Rechazada</h1>
                    <p className="text-red-700">
                        Hubo un problema con tus documentos. Por favor intenta subirlos nuevamente.
                    </p>
                    <Link href="/verify">
                        <Button className="bg-red-600 hover:bg-red-700 text-white">
                            Intentar Nuevamente
                        </Button>
                    </Link>
                </div>
            </div>
        )
    }

    // 4. Verified -> Show Order Form
    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8 dark:bg-black">
            <div className="max-w-md mx-auto">
                <div className="flex items-center gap-2 mb-6">
                    <Link href="/dashboard">
                        <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-emerald-400">New Cash Request</h1>
                </div>
                <OrderForm />
            </div>
        </div>
    )
}
