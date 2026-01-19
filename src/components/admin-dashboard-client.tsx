'use client'

import { useState } from 'react'
import { cancelOrder } from '@/app/actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, DollarSign, Package, Users, XCircle, AlertCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'

interface Order {
    id: string
    created_at: string
    amount: number
    status: string
    user_id: string
    delivery_code: string
    location_lat: number
    service_fee: number
    total_amount: number
    client_name: string
    client_email: string
    driver_name: string
}

interface AdminDashboardClientProps {
    initialOrders: Order[]
}

export default function AdminDashboardClient({ initialOrders }: AdminDashboardClientProps) {
    const [orders, setOrders] = useState<Order[]>(initialOrders)
    const { toast } = useToast()
    const router = useRouter()
    const [isRefreshing, setIsRefreshing] = useState(false)

    const handleCancel = async (orderId: string) => {
        if (!confirm('¿Seguro que deseas cancelar esta orden?')) return

        const res = await cancelOrder(orderId)
        if (res?.error) {
            toast({ title: 'Error', description: res.error, variant: 'destructive' })
        } else {
            toast({ title: 'Cancelada', description: 'La orden ha sido cancelada.' })
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'cancelled' } : o))
            router.refresh()
        }
    }

    const handleRefresh = () => {
        setIsRefreshing(true)
        router.refresh()
        setTimeout(() => setIsRefreshing(false), 1000)
    }

    // Stats Calculation
    const totalMovido = orders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? Number(o.total_amount) : 0), 0)
    const netProfit = orders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? Number(o.service_fee) : 0), 0)

    // Active orders (not delivered/cancelled)
    const activeOrdersCount = orders.filter(o => !['delivered', 'cancelled'].includes(o.status)).length

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold font-serif text-[#D4AF37]">Admin Dashboard</h1>
                <Button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    variant="outline"
                    className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                >
                    {isRefreshing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Refresh Data
                </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <Card className="bg-zinc-900 border-zinc-800 text-white shadow-lg shadow-zinc-900/50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">Ventas Totales (GMV)</CardTitle>
                        <DollarSign className="h-4 w-4 text-[#D4AF37]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">${totalMovido.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card className="bg-zinc-900 border-zinc-800 text-white shadow-lg shadow-zinc-900/50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">Ganancia Neta (10%)</CardTitle>
                        <DollarSign className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-emerald-400">${netProfit.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card className="bg-zinc-900 border-zinc-800 text-white shadow-lg shadow-zinc-900/50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">Pedidos Activos</CardTitle>
                        <Package className="h-4 w-4 text-zinc-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{activeOrdersCount}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Orders Table */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
                <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
                    <h2 className="font-bold text-lg">Live Orders</h2>
                    <span className="text-zinc-500 text-xs uppercase tracking-widest flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Real-time
                    </span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-zinc-950/50 text-zinc-400">
                            <tr>
                                <th className="px-6 py-4 text-left font-bold">ID</th>
                                <th className="px-6 py-4 text-left font-bold">Client Email</th>
                                <th className="px-6 py-4 text-left font-bold">Total</th>
                                <th className="px-6 py-4 text-left font-bold">Status</th>
                                <th className="px-6 py-4 text-left font-bold">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {orders.map((order) => (
                                <tr key={order.id} className="hover:bg-zinc-800/50 transition-colors">
                                    <td className="px-6 py-4 font-mono text-zinc-500 text-xs">#{order.id.slice(0, 6)}</td>
                                    <td className="px-6 py-4 font-medium text-white">
                                        {order.client_email}
                                        <div className="text-xs text-zinc-500 font-normal">{order.client_name}</div>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-[#D4AF37]">${Number(order.total_amount).toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={`
                                            px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                                            ${order.status === 'delivered' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900' :
                                                order.status === 'cancelled' ? 'bg-red-950 text-red-500 border border-red-900' :
                                                    order.status === 'in_transit' ? 'bg-blue-950 text-blue-400 border border-blue-900' :
                                                        'bg-amber-950 text-amber-500 border border-amber-900'}
                                        `}>
                                            {order.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-zinc-500 text-xs">
                                        {new Date(order.created_at).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                            {orders.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-zinc-500 italic">
                                        No orders found in the system.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
