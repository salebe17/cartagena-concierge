'use client'

import { useState } from 'react'
import { cancelOrder, approveUser } from '@/app/actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, DollarSign, Package, Users, ShieldCheck, CheckCircle } from 'lucide-react'
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

interface PendingUser {
    id: string
    full_name: string
    email: string
    kyc_id_url: string
    kyc_selfie_url: string
    kyc_status: string
}

interface AdminDashboardClientProps {
    initialOrders: Order[]
    initialPendingUsers?: PendingUser[]
}

export default function AdminDashboardClient({ initialOrders, initialPendingUsers = [] }: AdminDashboardClientProps) {
    const [orders, setOrders] = useState<Order[]>(initialOrders)
    const [pendingUsers, setPendingUsers] = useState<PendingUser[]>(initialPendingUsers)
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

    const handleApproveKYC = async (userId: string) => {
        if (!confirm('Approve this user?')) return
        const res = await approveUser(userId)
        if (res?.error) {
            toast({ title: 'Error', description: res.error, variant: 'destructive' })
        } else {
            toast({ title: 'Approved', description: 'User KYC verified.' })
            setPendingUsers(prev => prev.filter(u => u.id !== userId))
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
                <div className="flex gap-2">
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

            {/* KYC Pending Section */}
            {pendingUsers.length > 0 && (
                <div className="mb-10 space-y-4">
                    <div className="flex items-center gap-2 text-yellow-500">
                        <ShieldCheck className="w-6 h-6" />
                        <h2 className="text-xl font-bold">Pending KYC Verifications ({pendingUsers.length})</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pendingUsers.map(user => (
                            <Card key={user.id} className="bg-zinc-900 border-yellow-500/30 overflow-hidden">
                                <CardHeader className="bg-yellow-500/10 border-b border-yellow-500/10 pb-3">
                                    <CardTitle className="text-sm font-bold text-yellow-500 flex justify-between">
                                        {user.full_name || 'No Name'}
                                        <span className="text-xs font-mono text-zinc-400">{user.email}</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 space-y-4">
                                    <div className="flex gap-2 h-32">
                                        {/* ID Image */}
                                        <div className="flex-1 bg-black rounded-lg border border-zinc-800 relative group cursor-pointer" onClick={() => window.open(user.kyc_id_url, '_blank')}>
                                            <img src={user.kyc_id_url} alt="ID" className="w-full h-full object-cover rounded-lg opacity-80 group-hover:opacity-100 transition-opacity" />
                                            <span className="absolute bottom-1 right-1 bg-black/70 text-[10px] px-1 rounded text-white font-mono">ID</span>
                                        </div>
                                        {/* Selfie Image */}
                                        <div className="flex-1 bg-black rounded-lg border border-zinc-800 relative group cursor-pointer" onClick={() => window.open(user.kyc_selfie_url, '_blank')}>
                                            <img src={user.kyc_selfie_url} alt="Selfie" className="w-full h-full object-cover rounded-lg opacity-80 group-hover:opacity-100 transition-opacity" />
                                            <span className="absolute bottom-1 right-1 bg-black/70 text-[10px] px-1 rounded text-white font-mono">SELFIE</span>
                                        </div>
                                    </div>
                                    <Button onClick={() => handleApproveKYC(user.id)} className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold text-xs h-10">
                                        <CheckCircle className="w-4 h-4 mr-2" /> Approve & Enable
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Orders Table */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
                <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
                    <h2 className="font-bold text-lg">Live Orders</h2>
                    <div className="flex items-center gap-4">
                        <span className="text-zinc-500 text-xs uppercase tracking-widest flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            Real-time
                        </span>
                    </div>
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
