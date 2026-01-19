'use client'

import { useEffect, useState } from 'react'
import { getAdminOrders, cancelOrder } from '@/app/actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, DollarSign, Package, Users, XCircle, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'

interface Order {
    id: string
    created_at: string
    amount: number
    status: string
    user_id: string
    delivery_code: string
    location_lat: number
}

export default function AdminPage() {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const { toast } = useToast()

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        const data = await getAdminOrders()
        setOrders(data || [])
        setLoading(false)
    }

    const handleCancel = async (orderId: string) => {
        if (!confirm('Are you sure you want to cancel this order?')) return

        const res = await cancelOrder(orderId)
        if (res?.error) {
            toast({ title: 'Error', description: res.error, variant: 'destructive' })
        } else {
            toast({ title: 'Success', description: 'Order cancelled' })
            loadData()
        }
    }

    // Stats Calculation
    const totalMovido = orders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? o.amount : 0), 0)
    const today = new Date().toISOString().split('T')[0]
    const ordenesHoy = orders.filter(o => o.created_at.startsWith(today)).length
    // Mock active drivers for now as we don't really track session state in DB easily without presence
    const activeDrivers = 3

    if (loading) return <div className="p-10 text-center"><Loader2 className="animate-spin inline mr-2" /> Loading Admin Dashboard...</div>

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <Card className="bg-zinc-900 border-zinc-800 text-white">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">Total Movido</CardTitle>
                        <DollarSign className="h-4 w-4 text-zinc-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">${totalMovido.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card className="bg-zinc-900 border-zinc-800 text-white">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">Órdenes Hoy</CardTitle>
                        <Package className="h-4 w-4 text-zinc-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{ordenesHoy}</div>
                    </CardContent>
                </Card>
                <Card className="bg-zinc-900 border-zinc-800 text-white">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">Conductores Activos</CardTitle>
                        <Users className="h-4 w-4 text-zinc-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-emerald-500">{activeDrivers}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Orders Table */}
            <div className="bg-white text-zinc-900 rounded-xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-zinc-100 border-b border-zinc-200">
                            <tr>
                                <th className="px-6 py-4 text-left font-bold text-zinc-500">ID</th>
                                <th className="px-6 py-4 text-left font-bold text-zinc-500">User ID (Short)</th>
                                <th className="px-6 py-4 text-left font-bold text-zinc-500">Amount</th>
                                <th className="px-6 py-4 text-left font-bold text-zinc-500">Status</th>
                                <th className="px-6 py-4 text-left font-bold text-zinc-500">Date</th>
                                <th className="px-6 py-4 text-right font-bold text-zinc-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {orders.map((order) => (
                                <tr key={order.id} className="hover:bg-zinc-50 transition-colors">
                                    <td className="px-6 py-4 font-mono text-zinc-400">#{order.id.slice(0, 5)}</td>
                                    <td className="px-6 py-4 text-zinc-600">{order.user_id.slice(0, 8)}...</td>
                                    <td className="px-6 py-4 font-bold text-zinc-900">${order.amount.toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={`
                                            px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                                            ${order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' :
                                                order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}
                                        `}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-zinc-500">
                                        {new Date(order.created_at).toLocaleDateString()}
                                        <span className="text-xs text-zinc-300 ml-1">{new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {order.status === 'pending' && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => handleCancel(order.id)}
                                            >
                                                <XCircle className="w-4 h-4 mr-1" />
                                                Cancel
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {orders.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-zinc-400">
                                        No recent orders found.
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
