import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusCircle, MapPin, Clock, Package } from 'lucide-react';
// ... other imports ...

export default async function DashboardPage() {
    const supabase = createClient()
    const { data: { user } } = await (await supabase).auth.getUser()

    if (!user) {
        redirect('/')
    }

    const { data: orders } = await (await supabase)
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    return (
        <div className="min-h-screen bg-black text-white p-4">
            <header className="mb-8 flex justify-between items-center">
                <div className="flex flex-col">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                        My Orders
                    </h1>
                    <div className="text-sm text-zinc-400">
                        {user.email}
                    </div>
                </div>
                <Link href="/order">
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
                        <PlusCircle className="h-4 w-4" />
                        Request Cash
                    </Button>
                </Link>
            </header>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {orders?.map((order) => (
                    <Card key={order.id} className="bg-zinc-900 border-zinc-800 text-zinc-100">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-xl font-bold text-emerald-400">
                                    ${order.amount.toLocaleString()}
                                </CardTitle>
                                <Badge variant={order.status === 'delivered' ? 'default' : 'outline'} className={
                                    order.status === 'delivered' ? 'bg-emerald-600' : 'text-zinc-400 border-zinc-700'
                                }>
                                    {order.status.toUpperCase()}
                                </Badge>
                            </div>
                            <CardDescription className="text-zinc-500 text-xs">
                                Order ID: {order.id.slice(0, 8)}...
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center text-zinc-400">
                                <MapPin className="mr-2 h-4 w-4 text-emerald-500" />
                                <span>{order.distance_km}km from Alto Bosque</span>
                            </div>
                            <div className="flex items-center text-zinc-400">
                                <Clock className="mr-2 h-4 w-4 text-emerald-500" />
                                <span>{new Date(order.created_at).toLocaleDateString()}</span>
                            </div>

                            {/* Secure Delivery Code Section */}
                            <div className="bg-black/50 p-4 rounded-lg border border-zinc-800 mt-4">
                                <p className="text-xs text-zinc-500 mb-2 uppercase tracking-wider font-bold">Secure Delivery Code</p>
                                {order.status === 'paid' || order.status === 'pending' ? ( // Showing for pending too for demo purposes, usually strictly 'paid'
                                    <div className="text-3xl font-mono font-bold text-center tracking-[0.5em] text-white">
                                        {order.delivery_code}
                                    </div>
                                ) : (
                                    <div className="text-center text-zinc-600 italic">
                                        {order.status === 'delivered' ? 'Delivered' : 'Payment Required'}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {(!orders || orders.length === 0) && (
                    <div className="col-span-full text-center py-12 text-zinc-500">
                        No active orders found.
                    </div>
                )}
            </div>
        </div>
    )
}
