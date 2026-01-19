import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Calendar, Check, DollarSign, MapPin } from 'lucide-react'

export const metadata = {
    title: 'Order History | Cartagena Luxury Concierge',
    description: 'View your past cash delivery requests.',
}

export default async function HistoryPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return redirect('/login')

    const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    return (
        <div className="min-h-screen bg-[#F9FAFB] text-zinc-900 pb-20">
            {/* Header */}
            <header className="bg-white border-b border-zinc-100 sticky top-0 z-10">
                <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/dashboard" className="flex items-center text-sm font-medium text-zinc-500 hover:text-zinc-900">
                        <ArrowLeft className="w-4 h-4 mr-1" /> Dashboard
                    </Link>
                    <span className="font-serif italic font-bold text-lg">Order History</span>
                    <div className="w-16"></div> {/* Spacer for symmetry */}
                </div>
            </header>

            <main className="max-w-md mx-auto p-4 space-y-6 mt-4">

                <h1 className="text-2xl font-bold tracking-tight px-1">Recent Requests</h1>

                {!orders || orders.length === 0 ? (
                    <div className="text-center py-12 text-zinc-500">
                        No order history found.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <Card key={order.id} className="border-none shadow-sm hover:shadow-md transition-shadow bg-white overflow-hidden">
                                <CardContent className="p-0">
                                    <div className="flex">
                                        {/* Status Strip */}
                                        <div className={`w-2 ${order.status === 'delivered' ? 'bg-emerald-500' : 'bg-amber-400'}`}></div>

                                        <div className="flex-1 p-5 space-y-3">
                                            <div className="flex justify-between items-start">
                                                <div className="space-y-1">
                                                    <p className="text-xs text-zinc-400 font-medium uppercase tracking-wider">
                                                        {new Date(order.created_at).toLocaleDateString(undefined, {
                                                            month: 'short', day: 'numeric', year: 'numeric'
                                                        })}
                                                    </p>
                                                    <div className="flex items-center font-bold text-lg">
                                                        ${order.amount.toLocaleString()}
                                                    </div>
                                                </div>
                                                <Badge className={`
                                                    ${order.status === 'delivered' ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100' : 'bg-zinc-100 text-zinc-800 hover:bg-zinc-100'}
                                                    border-none px-2 py-0.5 text-xs uppercase
                                                `}>
                                                    {order.status.replace('_', ' ')}
                                                </Badge>
                                            </div>

                                            <div className="flex justify-between items-end pt-2 border-t border-zinc-50">
                                                <div className="flex items-center text-xs text-zinc-500">
                                                    <MapPin className="w-3 h-3 mr-1" />
                                                    {/* We don't have neighborhood stored as text, just distance logic. Simulating location. */}
                                                    ~{order.distance_km}km Range
                                                </div>

                                                {order.status === 'delivered' && (
                                                    <div className="flex items-center text-emerald-600 text-xs font-bold">
                                                        <Check className="w-3 h-3 mr-1" /> Completed
                                                    </div>
                                                )}

                                                {order.status !== 'delivered' && (
                                                    <div className="text-xs font-mono text-zinc-400">
                                                        CODE: <span className="text-zinc-900 font-bold">{order.delivery_code}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}
