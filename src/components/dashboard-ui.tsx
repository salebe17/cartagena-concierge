'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, MapPin, Clock, CheckCircle2, RotateCcw } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import TrackingMap from '@/components/tracking-map'
import { Badge } from '@/components/ui/badge'
import { useLanguage } from '@/hooks/useLanguage'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface DashboardUIProps {
    user: {
        email?: string
    }
    order: any // Type this properly if possible, but 'any' allows quick iteration for now
}

export default function DashboardUI({ user, order }: DashboardUIProps) {
    const { t } = useLanguage()
    const router = useRouter()
    const supabase = createClient()
    const [previousStatus, setPreviousStatus] = useState<string | null>(order?.status || null)
    const [showToast, setShowToast] = useState(false)
    const [toastMessage, setToastMessage] = useState('')

    useEffect(() => {
        if (!order) return

        const channel = supabase
            .channel('realtime-orders')
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'orders',
                filter: `id=eq.${order.id}`
            }, (payload) => {
                // console.log('Change received!', payload)
                router.refresh() // Refresh server data instantly
            })
            .subscribe()

        return () => { supabase.removeChannel(channel) }
    }, [order?.id, router, supabase])

    // Sensory Feedback Logic
    // Sensory Feedback Logic
    useEffect(() => {
        if (order && previousStatus && previousStatus !== order.status) {
            let audioUrl = ''
            let message = ''

            // Define behavior based on new status
            if (order.status === 'in_transit' || order.status === 'assigned') {
                audioUrl = 'https://assets.mixkit.co/sfx/preview/mixkit-happy-bells-notification-937.mp3'
                message = '🚗 Tu conductor va en camino'
            } else if (order.status === 'delivered') {
                audioUrl = 'https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3'
                message = '✅ Orden completada'
            } else {
                // Default generic update
                audioUrl = 'https://assets.mixkit.co/sfx/preview/mixkit-happy-bells-notification-937.mp3'
                message = `🔔 Actualización: ${order.status.replace('_', ' ')}`
            }

            if (audioUrl) {
                const audio = new Audio(audioUrl)
                audio.play().catch(e => console.error("Audio error:", e))
            }

            if (message) {
                setToastMessage(message)
                setShowToast(true)
                // Auto hide
                const timer = setTimeout(() => setShowToast(false), 4000)
                return () => clearTimeout(timer)
            }
        }

        // Update tracker (if order exists)
        if (order) setPreviousStatus(order.status)

    }, [order?.status, previousStatus])


    const isFinished = order && ['delivered', 'cancelled'].includes(order.status)

    return (
        <div className="min-h-screen bg-[#F9FAFB] text-zinc-900 pb-20 relative">
            {/* Custom Sensory Toast Overlay */}
            <div className={`
                fixed top-4 left-4 right-4 z-50 flex justify-center pointer-events-none transition-all duration-500 ease-out
                ${showToast ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0'}
            `}>
                <div className="bg-zinc-900/95 backdrop-blur text-white px-6 py-4 rounded-xl shadow-2xl flex items-center justify-center gap-3 border border-[#D4AF37] w-full max-w-sm">
                    <div className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse shadow-[0_0_10px_#D4AF37]" />
                    <span className="font-medium text-sm font-serif tracking-wide">{toastMessage}</span>
                </div>
            </div>

            {/* Helper Header */}
            <header className="bg-white border-b border-zinc-100 sticky top-0 z-10">
                <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
                    <span className="font-serif italic font-bold text-lg">Cartagena Concierge</span>
                    <div className="text-xs text-zinc-400">
                        {user.email?.slice(0, 20)}...
                    </div>
                </div>
            </header>

            <main className="max-w-md mx-auto p-4 space-y-6 mt-4">

                <div className="flex justify-between items-end">
                    <h1 className="text-3xl font-bold tracking-tight">Your <br /> Dashboard</h1>
                    <div className="flex gap-2">
                        <Link href="/history">
                            <Button variant="outline" size="sm" className="bg-white hover:bg-zinc-50 rounded-full px-4 border-zinc-200">
                                History
                            </Button>
                        </Link>
                        {!order && (
                            <Link href="/">
                                <Button size="sm" className="bg-zinc-900 text-white hover:bg-black rounded-full px-4">
                                    <Plus className="w-4 h-4 mr-1" /> New Request
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>

                {/* SCENARIO 1: NO ORDERS */}
                {!order && (
                    <Card className="border-dashed border-zinc-200 shadow-none bg-zinc-50">
                        <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                            <div className="w-12 h-12 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-400">
                                <MapPin className="w-6 h-6" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="font-medium">No Active Requests</h3>
                                <p className="text-sm text-zinc-500">You haven't requested any services yet.</p>
                            </div>
                            <Link href="/" className="w-full">
                                <Button className="w-full mt-4 bg-zinc-900 text-white hover:bg-black h-12">
                                    Start New Request
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                )}

                {/* SCENARIO 2: FINISHED ORDER */}
                {isFinished && (
                    <div className="space-y-6">
                        <Card className="border-none shadow-lg bg-emerald-900 text-white overflow-hidden relative">
                            {/* Abstract Pattern overlay */}
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <CheckCircle2 className="w-32 h-32" />
                            </div>

                            <CardContent className="p-8 text-center space-y-6 relative z-10">
                                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto backdrop-blur-sm">
                                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                                </div>

                                <div className="space-y-2">
                                    <h2 className="text-2xl font-bold">Service Fulfilled</h2>
                                    <p className="text-emerald-100/80 text-sm">Order #{order.id.slice(0, 8)} has been successfully fulfilled.</p>
                                </div>

                                <Link href="/" className="block">
                                    <Button className="w-full bg-white text-emerald-900 hover:bg-emerald-50 h-12 font-bold">
                                        <RotateCcw className="w-4 h-4 mr-2" /> Request Again
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>

                        <div className="text-center text-xs text-zinc-400">
                            Need help with this order? <a href="#" className="underline">Contact Support</a>
                        </div>
                    </div>
                )}

                {/* SCENARIO 3: ACTIVE ORDER */}
                {order && !isFinished && (
                    <div className="space-y-6">
                        {/* Status Card */}
                        <Card className="border-none shadow-xl bg-white overflow-hidden">
                            <CardHeader className="border-b border-zinc-50 pb-4">
                                <div className="flex justify-between items-center">
                                    <div className="space-y-1">
                                        <CardTitle className="text-sm uppercase tracking-wider text-zinc-500 font-medium">Current Status</CardTitle>
                                        <div className="flex items-center gap-2">
                                            <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-none px-3 py-1 rounded-full capitalize">
                                                {order.status.replace('_', ' ')}
                                            </Badge>
                                            <span className="text-xs text-zinc-400 flex items-center">
                                                <Clock className="w-3 h-3 mr-1" /> Updated just now
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-zinc-900">${order.amount.toLocaleString()}</div>
                                        <div className="text-xs text-zinc-400">Amount</div>
                                    </div>
                                </div>
                            </CardHeader>

                            {/* Map Section */}
                            <div className="h-[320px] bg-zinc-100 relative">
                                <TrackingMap lat={order.location_lat} lng={order.location_lng} />
                            </div>

                            {/* Details Footer */}
                            <div className="p-6 bg-zinc-900 text-white">
                                <div className="flex flex-col items-center text-center gap-2">
                                    <p className="text-zinc-400 text-xs uppercase tracking-wider font-bold mb-1">{t.security_code_label || "Security Code"}</p>
                                    <p className="text-5xl font-mono tracking-[0.2em] font-bold text-[#D4AF37] select-all">
                                        {order.delivery_code}
                                    </p>
                                    <p className="text-zinc-300 text-xs mt-2 font-medium bg-zinc-800/50 px-3 py-1 rounded-full border border-zinc-700">
                                        ⚠️ {t.security_code_instruction || "Share only upon receipt."}
                                    </p>
                                </div>
                            </div>
                        </Card>

                        <div className="text-center">
                            <Button variant="ghost" className="text-zinc-400 hover:text-zinc-900 btn-sm">
                                Cancel Order
                            </Button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
