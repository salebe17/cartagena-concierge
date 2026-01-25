import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { MapPin, DollarSign } from 'lucide-react'

import { LogoutButton } from '@/components/logout-button'

export default async function DriverPage() {
    const supabase = createClient()

    // In a real app, we'd check if user has 'driver' role.

    // Fetch 'paid' and 'pending' orders for demo purposes
    const { data: orders } = await (await supabase)
        .from('orders')
        .select('*')
        .in('status', ['paid', 'pending'])
        .order('created_at', { ascending: false })

    return (
        <div className="min-h-screen bg-black text-white p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-emerald-400">Driver Console</h1>
                <LogoutButton />
            </div>

            <div className="grid gap-4">
                {orders?.map((order: any) => (
                    <Link key={order.id} href={`/driver/order/${order.id}`}>
                        <Card className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800 transition-colors cursor-pointer">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-lg font-bold text-white">
                                    ${order.amount.toLocaleString()}
                                </CardTitle>
                                <Badge className="bg-emerald-600">
                                    {order.status}
                                </Badge>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center text-zinc-400 mb-2">
                                    <MapPin className="mr-2 h-4 w-4" />
                                    <span>{order.distance_km}km trip</span>
                                </div>
                                <div className="flex items-center text-zinc-400">
                                    <DollarSign className="mr-2 h-4 w-4" />
                                    <span>Fee: ${order.service_fee + order.delivery_fee}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}

                {(!orders || orders.length === 0) && (
                    <div className="text-center text-zinc-500 mt-10">No available orders.</div>
                )}
            </div>
        </div>
    )
}
